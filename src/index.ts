
import fastify, { FastifyReply, FastifyRequest } from 'fastify';
import FastifyWebSocket from '@fastify/websocket';
import socketRoutes from './socketRoutes';

const app = fastify({
  logger: false,
});

app.register(FastifyWebSocket);
app.register(socketRoutes);

// Deployment health ping
app.get('/healthz', (_request: FastifyRequest, _reply: FastifyReply) => {
});

app.listen({ port: 10001, host: '0.0.0.0' }, (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
