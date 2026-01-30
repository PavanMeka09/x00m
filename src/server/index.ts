import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

type SignalMessage =
  | { type: "JOIN_ROOM"; roomId: string; userId: string }
  | { type: "PEER_JOINED"; userId: string }
  | { type: "PEER_LEFT"; userId: string }
  | { type: "OFFER"; roomId: string; from: string; to: string; sdp: any }
  | { type: "ANSWER"; roomId: string; from: string; to: string; sdp: any }
  | { type: "ICE"; roomId: string; from: string; to: string; candidate: any };

type Room = Map<string, WebSocket>;
const rooms = new Map<string, Room>();

wss.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (data) => {
    let msg: SignalMessage;

    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }

    switch (msg.type) {
      case "JOIN_ROOM": {
        const { roomId, userId } = msg;

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Map());
        }

        const room = rooms.get(roomId)!;
        room.set(userId, socket);

        (socket as any).roomId = roomId;
        (socket as any).userId = userId;

        // notify others
        room.forEach((client, uid) => {
          if (uid !== userId) {
            client.send(JSON.stringify({
              type: "PEER_JOINED",
              userId
            }));
          }
        });

        break;
      }

      case "OFFER":
      case "ANSWER":
      case "ICE": {
        const room = rooms.get(msg.roomId);
        if (!room) return;

        const target = room.get(msg.to);
        if (target?.readyState === WebSocket.OPEN) {
          target.send(JSON.stringify(msg));
        }

        break;
      }
    }
  });

  socket.on("close", () => {
    const { roomId, userId } = socket as any;
    if (!roomId || !userId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    room.delete(userId);

    room.forEach((client) => {
      client.send(JSON.stringify({
        type: "PEER_LEFT",
        userId
      }));
    });

    if (room.size === 0) {
      rooms.delete(roomId);
    }
  });
});