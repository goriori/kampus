import { Server } from './entities/server';

const bootstrap = async (): Promise<void> => {
  try {
    const server = new Server();

    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      await server.shutdown();
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT signal received: closing HTTP server');
      await server.shutdown();
    });

    await server.start();
  } catch (error) {
    console.error('Failed to bootstrap application:', error);
    process.exit(1);
  }
};

bootstrap();

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
