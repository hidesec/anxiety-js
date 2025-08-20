import 'reflect-metadata';
import express, { Request, Response } from 'express';
import { controllers } from './controllers';
import { RouterEngine } from './core/router/router-engine';

const app = express();

// Middleware untuk parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route utama
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Hello there! Welcome to Anxiety Framework',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Inisialisasi RouterEngine
const routerEngine = new RouterEngine();

// Register semua controller
controllers.forEach((controller) => {
  routerEngine.registerController(controller);
});

// Gunakan router dari RouterEngine
app.use(routerEngine.getRouter());

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: any) => {
  console.error('Error occurred:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: error.message || 'Something went wrong!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Anxiety Framework is running on port ${PORT}!`);
  console.log(`📱 Server URL: http://localhost:${PORT}`);
});