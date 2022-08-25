import { v4 as uuidv4 } from 'uuid';
import type { SocketStream } from '@fastify/websocket';
import type { MessageType } from './connection.types';
import { zString, Message } from './connection.types';
import Queue from './Queue';

const Clients: Map<string, SocketStream> = new Map<string, SocketStream>();
const Matches: Map<string, string> = new Map<string, string>();

const queue: Queue = new Queue();

class Connection {
  id: string;
  connection: SocketStream;

  constructor(connection: SocketStream) {
    this.id = uuidv4();
    this.connection = connection;

    // Connection established
    Clients.set(this.id, this.connection);
    const messageJson: string = JSON.stringify({ type: 'id', message: `${this.id}` });

    this.connection.socket.send(messageJson);

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
            let messageJson: string = JSON.stringify({ type: 'queued user' });
            this.connection.socket.send(messageJson);

            // Check if there are enough people in the queue
            let clientId1: string = '';
            let clientId2: string = '';
            while (queue.size() > 1) {
              // Continuously pair the top two users
              clientId1 = zString.parse(queue.dequeue());
              clientId2 = zString.parse(queue.dequeue());
              console.log(`pairing ${clientId1} and ${clientId2}`);

              // Inform the users of their match partners
              const clientSocket1 = Clients.get(clientId1);
              const clientSocket2 = Clients.get(clientId2);

              messageJson = JSON.stringify({ type: 'matched with user', message: clientId2 });
              clientSocket1?.socket.send(messageJson);

              messageJson = JSON.stringify({ type: 'matched with user', message: clientId1 });
              clientSocket2?.socket.send(messageJson);

              Matches.set(clientId1, clientId2);
              Matches.set(clientId2, clientId1);
            }
            break;
          case 'ready':
            // Client is done editing their board
            // Signal their opponent
            const opponentId = zString.parse(Matches.get(this.id));
            const opponentSocket = Clients.get(opponentId);

            const opponentReadyMessageJson: string = JSON.stringify({ type: 'opponent is ready' });
            opponentSocket?.socket.send(opponentReadyMessageJson);
            break;
        };
      } else {
        console.error(`malformatted websocket message received: ${message}`)
      }
    });

    this.connection.socket.on('close', () => {
      Clients.delete(this.id);

      // Unmatch opponents
      if (Matches.has(this.id)) {
        const opponentId = zString.parse(Matches.get(this.id));
        const opponentSocket = Clients.get(opponentId);

        const opponentDisconnectedMessageJson: string = JSON.stringify({ type: 'opponent disconnected' });
        opponentSocket?.socket.send(opponentDisconnectedMessageJson);

        Matches.delete(this.id);
        Matches.delete(opponentId);
      }
      
      console.log(`${this.id} disconnected`);
    });
  }
};

export default Connection;