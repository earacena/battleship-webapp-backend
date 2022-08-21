import { v4 as uuidv4 } from 'uuid';

import type { SocketStream } from '@fastify/websocket';
import type { FastifyInstance } from 'fastify';

const Clients: Map<string, SocketStream> = new Map<string, SocketStream>();

class Connection {
  id: string;
  connection: SocketStream;

  constructor(connection: SocketStream) {
    this.id = uuidv4();
    this.connection = connection;

    // Connection established
    const messageJSON: string = JSON.stringify({ type: 'id', message: `${this.id}`});

    this.connection.socket.send(messageJSON);

    this.connection.socket.on('message', (message: string) => {
      if (message.toString() === 'hi from client') {
        console.log(message.toString());
        const response: string = JSON.stringify({
          type: 'message',
          message: 'hi from server',
        });
        connection.socket.send(response);
      }
    });

    this.connection.socket.on('close', () => {
      Clients.delete(this.id);
      console.log(`${this.id} disconnected`);
    });
  }
};

async function socketRoutes(fastify: FastifyInstance) {
  fastify.get('/', { websocket: true }, (connection: SocketStream) => {
    // Connection established, send user client an Id
    const conn = new Connection(connection);
    console.log(`user connected: ${conn.id}`);
  });
}

export default socketRoutes;
