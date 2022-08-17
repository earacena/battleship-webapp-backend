
import fastify from 'fastify';
import FastifyWebSocket from '@fastify/websocket';
import socketRoutes from './connection';

const app = fastify({
  logger: false,
});

app.register(FastifyWebSocket);
app.register(socketRoutes);

app.listen({ port: 8080 }, (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
