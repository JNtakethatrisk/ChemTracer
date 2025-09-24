import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite-production";
import { initializeDatabase } from "./init-db";

const app = express();

// Trust proxy to get real IP addresses
app.set('trust proxy', true);

(async () => {
  // Initialize database tables
  await initializeDatabase();

  // Log all incoming requests with full details
  app.use((req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.socket.remoteAddress || 
                     'unknown';
    
    const start = Date.now();
    const path = req.path;
    const method = req.method;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      
      // Get response size
      const contentLength = res.get('content-length') || 0;
      
      // Format response preview (first 100 chars of body if JSON)
      let responsePreview = '';
      if (res.locals.body && status !== 204) {
        const bodyStr = JSON.stringify(res.locals.body);
        responsePreview = bodyStr.length > 100 ? bodyStr.substring(0, 100) + '…' : bodyStr;
      }
      
      log(`${method} ${path} ${status} in ${duration}ms :: ${responsePreview}`);
    });

    next();
  });

  await registerRoutes(app);

  // set up error handlers
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // In production, always serve static files
  serveStatic(app);

  // ALWAYS serve the app on the port specified in the environment variable PORT
  const port = parseInt(process.env.PORT || '5000', 10);
  app.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
