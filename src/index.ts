
import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import FastifyWebSocket from '@fastify/websocket';
import socketRoutes from './socketRoutes';

const app = fastify({
  logger: false,
});

app.register(FastifyWebSocket);
app.register(socketRoutes);

// Deployment health ping
app.get('/healthz', (_request: FastifyRequest, reply: FastifyReply) => {
  reply.code(200);
});

app.listen({ port: 8080 }, (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
