import type { SocketStream } from '@fastify/websocket';
import type { FastifyInstance } from 'fastify';

async function socketRoutes(fastify: FastifyInstance) {
  fastify.get('/', { websocket: true }, (connection: SocketStream) => {
    connection.socket.on('message', (message: string) => {
      if (message.toString() === 'hi from client') {
        console.log('hi from server');
        connection.socket.send('hi from server');
      }
    });
  });
}

export default socketRoutes;
