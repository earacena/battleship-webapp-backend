import type { SocketStream } from "@fastify/websocket";
import type { FastifyInstance } from "fastify";
import Connection from './Connection';

async function socketRoutes(fastify: FastifyInstance) {
  fastify.get('/', { websocket: true }, (connection: SocketStream) => {
    // Connection established, send user client an Id
    const conn = new Connection(connection);
    console.log(`user connected: ${conn.id}`);
  });
}

export default socketRoutes;