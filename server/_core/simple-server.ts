import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";

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
    console.log("[Server] Starting simple server...");
    const app = express();
    const server = createServer(app);
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Basic health check
    app.get("/health", (req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });
    
    // Root route
    app.get("/", (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>AmeriLend Dev Server</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            h1 { color: #333; }
            .status { background: #e8f5e9; padding: 10px; border-left: 4px solid #4caf50; margin: 10px 0; }
            code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ AmeriLend Dev Server Running</h1>
            <div class="status">
              <p><strong>Status:</strong> Server is online and responding</p>
              <p><strong>URL:</strong> http://localhost:${port}/</p>
              <p><strong>Health Check:</strong> /health</p>
            </div>
            <p>The dev server is successfully running. You can now access your application.</p>
          </div>
        </body>
        </html>
      `);
    });
    
    const preferredPort = parseInt(process.env.PORT || "3000");
    console.log("[Server] Looking for available port starting from", preferredPort);
    const port = await findAvailablePort(preferredPort);
    
    if (port !== preferredPort) {
      console.log(`[Server] Port ${preferredPort} is busy, using port ${port} instead`);
    }
    
    server.listen(port, () => {
      console.log(`[Server] ✅ Server running on http://localhost:${port}/`);
      console.log(`[Server] Open http://localhost:${port}/ in your browser`);
      console.log(`[Server] Press Ctrl+C to stop`);
    });
    
    // Keep server alive - handle graceful shutdown
    let shutdownInProgress = false;
    process.on("SIGINT", () => {
      if (shutdownInProgress) return;
      shutdownInProgress = true;
      console.log("[Server] Received SIGINT, shutting down...");
      server.close(() => {
        console.log("[Server] Server closed gracefully");
        process.exit(0);
      });
      // Force exit after 10 seconds if shutdown hangs
      setTimeout(() => {
        console.log("[Server] Forced shutdown due to timeout");
        process.exit(1);
      }, 10000);
    });
    
  } catch (err) {
    console.error("[Server] Startup error:", err);
    process.exit(1);
  }
}

startServer();
