import { v4 as uuidv4 } from "uuid";
import type { SocketStream } from "@fastify/websocket";
import type { MessageType } from "./connection.types";
import { zString, Message, PlayerFiredMessage } from "./connection.types";
import Queue from "./Queue";
import { z } from "zod";

const MatchInfo = z.object({
  opponentId: z.string(),
  playerTurn: z.string(),
  matchTurn: z.string(),
});

type MatchInfoType = z.infer<typeof MatchInfo>;

const Clients: Map<string, SocketStream> = new Map<string, SocketStream>();
const Matches: Map<string, MatchInfoType> = new Map<string, MatchInfoType>();

const queue: Queue = new Queue();

class Connection {
  id: string;
  connection: SocketStream;

  constructor(connection: SocketStream) {
    this.id = uuidv4();
    this.connection = connection;

    // Connection established
    Clients.set(this.id, this.connection);
    const messageJson: string = JSON.stringify({
      type: "id",
      id: `${this.id}`,
    });

    this.connection.socket.send(messageJson);

    this.connection.socket.on("message", (data: Buffer) => {
      const message: any = JSON.parse(zString.parse(data.toString()));

      if (message.hasOwnProperty("type")) {
        switch (message.type) {
          case "message":
            {
              const parsedMessage: MessageType = Message.parse(message);
              console.log(parsedMessage);
            }
            break;
          case "enqueue user":
            {
              queue.enqueue(this.id);
              console.log(
                `current person next in line at queue: ${queue.front()}`
              );

              // Notify user that they were queued
              let messageJson: string = JSON.stringify({ type: "queued user" });
              this.connection.socket.send(messageJson);

              // Check if there are enough people in the queue
              let clientId1: string = "";
              let clientId2: string = "";
              while (queue.size() > 1) {
                // Continuously pair the top two users
                clientId1 = zString.parse(queue.dequeue());
                clientId2 = zString.parse(queue.dequeue());
                console.log(`pairing ${clientId1} and ${clientId2}`);

                // Inform the users of their match partners
                const clientSocket1 = Clients.get(clientId1);
                const clientSocket2 = Clients.get(clientId2);

                messageJson = JSON.stringify({
                  type: "matched with user",
                  opponentId: clientId2,
                });
                clientSocket1?.socket.send(messageJson);

                messageJson = JSON.stringify({
                  type: "matched with user",
                  opponentId: clientId1,
                });
                clientSocket2?.socket.send(messageJson);

                Matches.set(clientId1, {
                  opponentId: clientId2,
                  playerTurn: "first",
                  matchTurn: "first",
                });
                Matches.set(clientId2, {
                  opponentId: clientId1,
                  playerTurn: "second",
                  matchTurn: "first",
                });

                // Inform users of their turn order
                messageJson = JSON.stringify({
                  type: "decide player turn",
                  turn: "first",
                });
                clientSocket1?.socket.send(messageJson);

                messageJson = JSON.stringify({
                  type: "decide player turn",
                  turn: "second",
                });
                clientSocket2?.socket.send(messageJson);
              }
            }
            break;
          case "ready":
            {
              // Client is done editing their board
              // Signal their opponent
              const opponentId = MatchInfo.parse(
                Matches.get(this.id)
              ).opponentId;
              const opponentSocket = Clients.get(opponentId);
              console.log(`${opponentId} is ready`);

              const opponentReadyMessageJson: string = JSON.stringify({
                type: "opponent is ready",
              });
              opponentSocket?.socket.send(opponentReadyMessageJson);
            }
            break;
          case "fired at position":
            {
              // A player has fired onto the board of another player

              // Retrieve match data
              const matchInfo = MatchInfo.parse(Matches.get(this.id));
              const playerFiredMessage = PlayerFiredMessage.parse(message);

              // Check if it was that player's turn
              if (matchInfo?.matchTurn === matchInfo?.playerTurn) {
                // Send firing information to opponent to check against
                const opponentId = MatchInfo.parse(
                  Matches.get(this.id)
                ).opponentId;
                const opponentSocket = Clients.get(opponentId);
                const messageJson: string = JSON.stringify({
                  type: "opponent fired",
                  position: playerFiredMessage.position,
                });
                opponentSocket?.socket.send(messageJson);
              }
            }
            break;
          case "report hit":
            {
              // Report that shot hit
              const opponentId = MatchInfo.parse(
                Matches.get(this.id)
                ).opponentId;
                console.log(`${opponentId} hit`);
              const opponentSocket = Clients.get(opponentId);
              const reportMessage = PlayerFiredMessage.parse(message);
              opponentSocket?.socket.send(
                JSON.stringify({
                  type: "reporting hit",
                  position: reportMessage.position,
                })
              );

              // Switch turns
              const matchInfo = MatchInfo.parse(Matches.get(this.id));
              const opponentMatchInfo = MatchInfo.parse(
                Matches.get(opponentId)
              );

              const newTurn =
                matchInfo?.matchTurn === "first" ? "second" : "first";
              opponentSocket?.socket.send(
                JSON.stringify({ type: "turn", turn: newTurn })
              );
              this.connection.socket.send(
                JSON.stringify({ type: "turn", turn: newTurn })
              );
              Matches.set(this.id, { ...matchInfo, matchTurn: newTurn });
              Matches.set(opponentId, {
                ...opponentMatchInfo,
                matchTurn: newTurn,
              });
            }
            break;
          case "report miss":
            {
              // Report that shot missed
              const opponentId = MatchInfo.parse(
                Matches.get(this.id)
              ).opponentId;
              console.log(`${opponentId} miss`);
              const opponentSocket = Clients.get(opponentId);
              const reportMessage = PlayerFiredMessage.parse(message);
              opponentSocket?.socket.send(
                JSON.stringify({
                  type: "reporting miss",
                  position: reportMessage.position,
                })
              );

              // Switch turns
              const matchInfo = MatchInfo.parse(Matches.get(this.id));
              const opponentMatchInfo = MatchInfo.parse(
                Matches.get(opponentId)
              );

              const newTurn =
                matchInfo?.matchTurn === "first" ? "second" : "first";
              opponentSocket?.socket.send(
                JSON.stringify({ type: "turn", turn: newTurn })
              );
              this.connection.socket.send(
                JSON.stringify({ type: "turn", turn: newTurn })
              );
              Matches.set(this.id, { ...matchInfo, matchTurn: newTurn });
              Matches.set(opponentId, {
                ...opponentMatchInfo,
                matchTurn: newTurn,
              });
            }
            break;
        }
      } else {
        console.error(`malformatted websocket message received: ${message}`);
      }
    });

    this.connection.socket.on("close", () => {
      Clients.delete(this.id);

      // Unmatch opponents
      if (Matches.has(this.id)) {
        const opponentId = MatchInfo.parse(Matches.get(this.id)).opponentId;
        const opponentSocket = Clients.get(opponentId);

        const opponentDisconnectedMessageJson: string = JSON.stringify({
          type: "opponent disconnected",
        });
        opponentSocket?.socket.send(opponentDisconnectedMessageJson);

        Matches.delete(this.id);
        Matches.delete(opponentId);
      }

      console.log(`${this.id} disconnected`);
    });
  }
}

export default Connection;
