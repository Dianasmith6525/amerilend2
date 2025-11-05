import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { handleAuthorizeNetWebhook, handleCryptoWebhook } from "./webhooks";
import { apiRateLimiter } from "./rateLimiter";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

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
    
    // Configure body parser with larger size limit for file uploads
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));
    console.log("[Server] Body parser middleware configured");
    
    // Apply general API rate limiting
    app.use("/api", apiRateLimiter);
    console.log("[Server] Rate limiter configured");
    
    // OAuth callback under /api/oauth/callback
    registerOAuthRoutes(app);
    console.log("[Server] OAuth routes registered");
    
    // Payment webhooks (use raw body for signature validation)
    app.post("/api/webhooks/authorizenet", express.raw({ type: "application/json" }), handleAuthorizeNetWebhook);
    app.post("/api/webhooks/crypto", express.raw({ type: "application/json" }), handleCryptoWebhook);
    console.log("[Server] Payment webhook routes registered");
    
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
    
    // tRPC API - MUST be after Vite/static but before catch-all routes
    app.use(
      "/api/trpc",
      createExpressMiddleware({
        router: appRouter,
        createContext,
      })
    );
    console.log("[Server] tRPC middleware configured");

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

    server.listen(port, () => {
      console.log(`[Server] Listening on http://localhost:${port}/`);
    });

    // Handle server errors
    server.on("error", (err) => {
      console.error("[Server] HTTP server error:", err);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason) => {
      console.error("[Server] Unhandled rejection:", reason);
      process.exit(1);
    });

    process.on("uncaughtException", (err) => {
      console.error("[Server] Uncaught exception:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("[Server] Startup error:", err);
    if (err instanceof Error) {
      console.error("[Server] Error stack:", err.stack);
    }
    process.exit(1);
  }
}

startServer().catch(console.error);
