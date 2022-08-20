import type { SocketStream } from '@fastify/websocket';
import type { FastifyInstance } from 'fastify';

const Clients: Map<number, SocketStream> = new Map<number, SocketStream>();
let clientCount: number = 0;

async function socketRoutes(fastify: FastifyInstance) {
  fastify.get('/', { websocket: true }, (connection: SocketStream) => {
    // Connection established, send user client an Id
    const messageJSON: string = JSON.stringify({ type: 'id', message: `${clientCount}` });
    Clients.set(clientCount, connection);
    clientCount += 1;
    console.log(`clients: ${Clients}, # of clients: ${clientCount}`);
    Clients.forEach((_socket) => {
      _socket.socket.send(JSON.stringify({ type: 'message', message: `${clientCount-1} has joined` }));
    });

    connection.socket.send(messageJSON);

    connection.socket.on('message', (message: string) => {
      if (message.toString() === 'hi from client') {
        console.log(message.toString());
        const response: string = JSON.stringify({
          type: 'message',
          message: 'hi from server',
        });
        connection.socket.send(response);
      }
    });
  });
}

export default socketRoutes;
