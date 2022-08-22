import { v4 as uuidv4 } from 'uuid';
import type { SocketStream } from '@fastify/websocket';
import type { MessageType } from './connection.types';
import { zString, Message } from './connection.types';
import Queue from './Queue';

const Clients: Map<string, SocketStream> = new Map<string, SocketStream>();
const queue: Queue = new Queue();

class Connection {
  id: string;
  connection: SocketStream;

  constructor(connection: SocketStream) {
    this.id = uuidv4();
    this.connection = connection;

    // Connection established
    const messageJSON: string = JSON.stringify({ type: 'id', message: `${this.id}` });

    this.connection.socket.send(messageJSON);

    this.connection.socket.on('message', (data: Buffer) => {
      const message: any = JSON.parse(zString.parse(data.toString()));
    
      if (message.hasOwnProperty('type')) {
        switch (message.type) {
          case 'message':
            const parsedMessage: MessageType = Message.parse(message);
            console.log(parsedMessage);
            break;
          case 'enqueue user':
            queue.enqueue(this.id);
            console.log(`current person next in line at queue: ${queue.front()}`);

            // Notify user that they were queued
            const messageJSON: string = JSON.stringify({ type: 'queued user' });
            this.connection.socket.send(messageJSON);
        };
      } else {
        console.error(`malformatted websocket message received: ${message}`)
      }
    });

    this.connection.socket.on('close', () => {
      Clients.delete(this.id);
      console.log(`${this.id} disconnected`);
    });
  }
};

export default Connection;