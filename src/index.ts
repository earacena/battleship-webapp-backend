
import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import FastifyWebSocket, { SocketStream } from '@fastify/websocket';
import FasififyStatic from '@fastify/static';
//import socketRoutes from './socketRoutes';
import path from 'path';
import Connection from './Connection';
const app = fastify({
  logger: false,
});
app.register(FastifyWebSocket);
app.register(FasififyStatic, {
  root: path.join(__dirname, 'build_frontend'),
});
// app.register(socketRoutes);

app.route({
  method: 'GET',
  url: '/hello',
  handler: (_request: FastifyRequest, reply: FastifyReply) => {
    reply.sendFile('index.html');
  },
  wsHandler: (connection: SocketStream, _request: FastifyRequest) => {
    // Connection established, send user client an Id
    const conn = new Connection(connection);
    console.log(`user connected: ${conn.id}`);
  }
})

app.listen({ port: 8080 }, (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log(`Server listening at ${address}`);
});
