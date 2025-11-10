import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import fs from "fs/promises";
import helmet from "helmet";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { handleAuthorizeNetWebhook, handleCryptoWebhook } from "./webhooks";
import { handleStripeWebhook } from "./stripe-webhook";
import { initializeRetryScheduler } from "./payment-retry";
import { apiRateLimiter } from "./rateLimiter";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import * as db from "../db";
import { healthCheck, isDbConnected, reconnectDb } from "../db";
import { validateEnvironment, printValidationResults } from "./env-validator";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  try {
    console.log("[Server] Starting...");
    const app = express();
    const server = createServer(app);
    console.log("[Server] Express app and HTTP server created");

    // Configure body parser with larger size limit for file uploads (EARLY)
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));
    console.log("[Server] Body parser middleware configured");

    // Security headers with helmet
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Vite dev mode needs eval
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: ["'self'", "https://gateway01.eu-central-1.prod.aws.tidbcloud.com"],
          fontSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: "deny",
      },
      referrerPolicy: {
        policy: "strict-origin-when-cross-origin",
      },
      crossOriginEmbedderPolicy: false, // Disable for file uploads
      crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
    }));
    console.log("[Server] Security headers configured with helmet");

    // Set up static file serving for uploads BEFORE any other routes
    const uploadsRoot = path.join(process.cwd(), "uploads");
    await fs.mkdir(uploadsRoot, { recursive: true });
    app.use("/uploads", express.static(uploadsRoot, {
      maxAge: "1d",
      index: false,  // Don't serve index files
      setHeaders: (res, path) => {
        // Allow direct file access without caching issues
        res.set("Cache-Control", "public, max-age=86400");
        res.set("X-Content-Type-Options", "nosniff");
      }
    }));
    console.log(`[Server] Serving uploaded documents from ${uploadsRoot}`);
    
    // Apply general API rate limiting
    app.use("/api", apiRateLimiter);
    console.log("[Server] Rate limiter configured");
    
    // OAuth callback under /api/oauth/callback
    registerOAuthRoutes(app);
    console.log("[Server] OAuth routes registered");
    
    // Payment webhooks (use raw body for signature validation)
    app.post("/api/webhooks/authorizenet", express.raw({ type: "application/json" }), handleAuthorizeNetWebhook);
    app.post("/api/webhooks/crypto", express.raw({ type: "application/json" }), handleCryptoWebhook);
    app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);
    console.log("[Server] Payment webhook routes registered");
    
    // Document upload endpoint
    app.post("/api/documents/upload", async (req: express.Request, res: express.Response) => {
      try {
        console.log("[Documents] Upload request received");
        
        const { applicationId, userId, documents } = req.body;
        
        if (!applicationId || !userId) {
          console.log("[Documents] Missing applicationId or userId");
          return res.status(400).json({ message: "Missing applicationId or userId" });
        }
        
        if (!documents || typeof documents !== "object") {
          console.log("[Documents] No documents provided");
          return res.status(400).json({ message: "No documents provided" });
        }
        
        const documentKeys = Object.keys(documents);
        console.log(`[Documents] Received ${documentKeys.length} document(s): ${documentKeys.join(", ")}`);
        
        // Validate all 5 required documents are present
        const requiredDocs = ["id_front", "id_back", "selfie", "ssn_document", "address_proof"];
        const missing = requiredDocs.filter(doc => !documents[doc]);
        if (missing.length > 0) {
          console.log(`[Documents] Missing required documents: ${missing.join(", ")}`);
          return res.status(400).json({ message: `Missing required documents: ${missing.join(", ")}` });
        }
        
        // Store each document to disk and record metadata
        const storedDocuments = [];
        for (const [docType, dataUrl] of Object.entries(documents)) {
          if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
            console.log(`[Documents] Invalid data URL for ${docType}`);
            continue;
          }
          
          // Extract MIME type and calculate file size
          const mimeMatch = dataUrl.match(/^data:([^;]+);/);
          const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
          const base64Index = dataUrl.indexOf(",");
          if (base64Index === -1) {
            console.log(`[Documents] Missing base64 payload for ${docType}`);
            continue;
          }
          const base64Payload = dataUrl.substring(base64Index + 1);
          const fileBuffer = Buffer.from(base64Payload, "base64");
          const sizeInBytes = fileBuffer.length;
          const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
          
          // Create filename with timestamp
          const timestamp = Date.now();
          const ext = mimeType.includes("pdf") ? "pdf" : mimeType.includes("image") ? "jpg" : "bin";
          const fileName = `${docType}_${timestamp}.${ext}`;
          const uploadDir = path.join(uploadsRoot, String(applicationId));
          const relativeUrl = `/uploads/${applicationId}/${fileName}`;
          
          console.log(`[Documents]   ${docType}: ${sizeInMB}MB (${mimeType})`);
          
          try {
            await fs.mkdir(uploadDir, { recursive: true });
            await fs.writeFile(path.join(uploadDir, fileName), fileBuffer);

            // Store document record in database
            await insertSubmittedDocument({
              loanApplicationId: applicationId,
              documentType: docType,
              fileName,
              fileUrl: relativeUrl,
              fileSize: sizeInBytes,
              mimeType,
              verificationStatus: "pending",
            });
            
            storedDocuments.push(docType);
            console.log(`[Documents] Successfully stored ${docType} -> ${relativeUrl}`);
          } catch (insertError) {
            console.error(`[Documents] Failed to store ${docType}:`, insertError);
          }
        }
        
        if (storedDocuments.length === 5) {
          // TODO: Send email notification to admin about document submission
          // TODO: Log event for audit trail
          
          console.log(`[Documents] All 5 documents successfully stored for application ${applicationId}`);
          return res.json({ 
            success: true, 
            message: "All documents uploaded successfully",
            applicationId,
            documentsStored: storedDocuments.length,
            submittedAt: new Date().toISOString()
          });
        } else {
          console.warn(`[Documents] Only ${storedDocuments.length}/5 documents were stored for application ${applicationId}`);
          return res.status(500).json({ 
            message: `Failed to store all documents. Stored: ${storedDocuments.length}/5`,
            documentsStored: storedDocuments.length,
            storedTypes: storedDocuments
          });
        }
      } catch (error) {
        console.error("[Documents] Upload error:", error);
        res.status(500).json({ message: "Failed to upload documents" });
      }
    });
    console.log("[Server] Document upload route registered");
    
    // Document reupload route - for updating specific documents that need reupload
    app.post("/api/documents/reupload", async (req: express.Request, res: express.Response) => {
      try {
        console.log("[Documents] Reupload request received");
        
        const { documentId, userId, dataUrl } = req.body;
        
        if (!documentId || !userId || !dataUrl) {
          console.log("[Documents] Missing required fields for reupload");
          return res.status(400).json({ message: "Missing documentId, userId, or dataUrl" });
        }
        
        // Get existing document record to verify ownership and get application ID
        const existingDoc = await db.getSubmittedDocumentById(documentId);
        if (!existingDoc) {
          return res.status(404).json({ message: "Document not found" });
        }
        
        // Verify the application belongs to the user
        const application = await db.getLoanApplicationById(existingDoc.loanApplicationId);
        if (!application || application.userId !== userId) {
          return res.status(403).json({ message: "Unauthorized" });
        }
        
        // Extract MIME type and file data
        const mimeMatch = dataUrl.match(/^data:([^;]+);/);
        const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
        const base64Index = dataUrl.indexOf(",");
        if (base64Index === -1) {
          return res.status(400).json({ message: "Invalid data URL" });
        }
        const base64Payload = dataUrl.substring(base64Index + 1);
        const fileBuffer = Buffer.from(base64Payload, "base64");
        const sizeInBytes = fileBuffer.length;
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
        
        // Create new filename with timestamp
        const timestamp = Date.now();
        const ext = mimeType.includes("pdf") ? "pdf" : mimeType.includes("image") ? "jpg" : "bin";
        const fileName = `${existingDoc.documentType}_${timestamp}.${ext}`;
        const uploadDir = path.join(uploadsRoot, String(existingDoc.loanApplicationId));
        const relativeUrl = `/uploads/${existingDoc.loanApplicationId}/${fileName}`;
        
        console.log(`[Documents] Reuploading ${existingDoc.documentType}: ${sizeInMB}MB (${mimeType})`);
        
        // Save new file
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, fileName), fileBuffer);
        
        // Update document record in database
        await db.updateSubmittedDocumentFile(documentId, {
          fileName,
          fileUrl: relativeUrl,
          fileSize: sizeInBytes,
          mimeType,
          verificationStatus: "pending", // Reset to pending after reupload
          uploadedAt: new Date(),
        });
        
        console.log(`[Documents] Successfully reuploaded ${existingDoc.documentType} -> ${relativeUrl}`);
        
        return res.json({
          success: true,
          message: "Document reuploaded successfully",
          documentId,
          fileUrl: relativeUrl,
        });
      } catch (error) {
        console.error("[Documents] Reupload error:", error);
        res.status(500).json({ message: "Failed to reupload document" });
      }
    });
    console.log("[Server] Document reupload route registered");
    
    // Document viewing route - serve individual documents
    app.get("/documents/:applicationId/:documentType", async (req: express.Request, res: express.Response) => {
      try {
        const { applicationId, documentType } = req.params;
        
        console.log(`[Documents] View request: app=${applicationId}, type=${documentType}`);
        
        // Query database for document
        const db = await import("../db");
        const docs = await db.getSubmittedDocumentsByApplicationId(parseInt(applicationId));
        const document = docs.find(d => d.documentType === documentType);
        
        if (!document) {
          console.log(`[Documents] Document not found: ${documentType} for application ${applicationId}`);
          return res.status(404).json({ message: "Document not found" });
        }
        
        // Build file path from filename
        const filePath = path.join(uploadsRoot, applicationId, document.fileName);
        
        console.log(`[Documents] Serving file: ${filePath}`);
        
        // Check if file exists
        try {
          await fs.access(filePath);
        } catch {
          console.log(`[Documents] File not found on disk: ${filePath}`);
          return res.status(404).json({ message: "File not found on disk" });
        }
        
        // Set correct content type
        res.setHeader("Content-Type", document.mimeType || "application/octet-stream");
        res.setHeader("Content-Disposition", `inline; filename="${document.fileName}"`);
        res.setHeader("Cache-Control", "private, max-age=86400"); // 1 day cache
        
        // Stream the file
        const fileBuffer = await fs.readFile(filePath);
        res.send(fileBuffer);
        
        console.log(`[Documents] Successfully served ${document.fileName} (${document.fileSize} bytes)`);
      } catch (error) {
        console.error("[Documents] View error:", error);
        res.status(500).json({ message: "Failed to retrieve document" });
      }
    });
    console.log("[Server] Document viewing route registered");
    
    // tRPC API - MUST be before Vite/static to avoid HTML responses
    app.use(
      "/api/trpc",
      createExpressMiddleware({
        router: appRouter,
        createContext,
      })
    );
    console.log("[Server] tRPC middleware configured");
    
    // development mode uses Vite, production mode uses static files
    if (process.env.NODE_ENV === "development") {
      console.log("[Server] Setting up Vite dev server...");
      try {
        await setupVite(app, server);
        console.log("[Server] Vite dev server configured successfully");
      } catch (viteError) {
        console.error("[Server] Vite setup error:", viteError);
        throw viteError;
      }
    } else {
      console.log("[Server] Using static file serving (production mode)");
      serveStatic(app);
    }
    
    // Global error handler - catches any unhandled errors from middleware
    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error("[Server] Global error handler caught:", err);
      
      // Don't send error response if headers already sent
      if (res.headersSent) {
        return next(err);
      }
      
      // Send JSON error response
      res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : "An error occurred",
      });
    });

    // 404 handler - catch any undefined routes
    app.use((req: express.Request, res: express.Response) => {
      console.warn(`[Server] 404 Not Found: ${req.method} ${req.path}`);
      res.status(404).json({ error: "Not found" });
    });

    const preferredPort = parseInt(process.env.PORT || "3000");
    console.log("[Server] Finding available port starting from", preferredPort);
    const port = await findAvailablePort(preferredPort);

    if (port !== preferredPort) {
      console.log(`[Server] Port ${preferredPort} is busy, using port ${port} instead`);
    }

    // Start listening - this will keep the process alive
    return new Promise<void>((resolve, reject) => {
      server.on("error", (err) => {
        console.error("[Server] Server error event:", err);
        reject(err);
      });

      server.listen(port, "0.0.0.0", () => {
        console.log(`[Server] ✅ Listening on http://localhost:${port}/`);
        console.log(`[Server] ✅ Ready to accept connections`);
        
        // Test database connection on startup
        healthCheck()
          .then((isConnected) => {
            if (isConnected) {
              console.log('[Database] ✅ Initial connection test successful');
              // Initialize payment retry scheduler after DB is confirmed connected
              initializeRetryScheduler(300000); // Run every 5 minutes
            } else {
              console.warn('[Database] ⚠️ Initial connection test failed - will retry');
            }
          })
          .catch((err) => {
            console.error('[Database] ⚠️ Initial connection error:', err.message);
          });
        
        // Resolve the promise to signal successful startup
        // The server will continue running and handling requests
        resolve();
      });
    });
  } catch (err) {
    console.error("[Server] ❌ Fatal error during startup:", err);
    if (err instanceof Error) {
      console.error("[Server] Stack trace:", err.stack);
    }
    process.exit(1);
  }
}

// Global process error handlers
process.on("unhandledRejection", (reason) => {
  console.error("[Process] ⚠️  Unhandled rejection:", reason);
  if (reason instanceof Error) {
    console.error("[Process] Stack trace:", reason.stack);
  }
  // Don't exit on unhandled rejection, just log it
});

process.on("uncaughtException", (err) => {
  console.error("[Process] ❌ Uncaught exception:", err);
  console.error("[Process] Stack trace:", err.stack);
  // Don't exit on uncaught exception in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.log("[Process] Continuing in development mode...");
  }
});

// Prevent premature exit on signals
process.on("SIGINT", () => {
  console.log("\n[Process] ⚠️  Received SIGINT - Press Ctrl+C again to exit");
  // Ignore first SIGINT in development
});

process.on("SIGTERM", () => {
  console.log("\n[Process] ⚠️  Received SIGTERM - ignoring");
});

process.on("exit", (code) => {
  console.log(`[Process] Process exiting with code: ${code}`);
});

// Keep process alive with a timer
const keepAlive = setInterval(() => {
  // This prevents the process from exiting
}, 60000); // Every minute

// Database health check timer - keep connection alive
const dbHealthCheck = setInterval(async () => {
  try {
    const isConnected = await healthCheck();
    if (!isConnected) {
      console.log('[Database] Health check failed, attempting reconnection...');
      await reconnectDb();
    } else {
      console.log('[Database] ✅ Health check passed');
    }
  } catch (error: any) {
    console.error('[Database] Health check error:', error.message);
  }
}, 30000); // Every 30 seconds

// DO NOT unref - we want the process to stay alive
// keepAlive.unref();

// Validate environment variables before starting server
const envValidation = validateEnvironment();
printValidationResults(envValidation);

if (!envValidation.isValid && process.env.NODE_ENV === 'production') {
  console.error("\n❌ Cannot start server in production with invalid environment");
  console.error("💡 Please fix the errors above and restart\n");
  process.exit(1);
}

// Start the server
console.log("[Bootstrap] Starting AmeriLend server...");
startServer()
  .then(() => {
    console.log("[Bootstrap] Server started successfully, process will stay alive");
  })
  .catch((err) => {
    console.error("[Bootstrap] ❌ Server startup failed:", err);
    if (err instanceof Error) {
      console.error("[Bootstrap] Stack trace:", err.stack);
    }
    process.exit(1);
  });

