import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

type SignalMessage =
  | { type: "JOIN_ROOM"; roomId: string; userId: string }
  | { type: "PEER_JOINED"; userId: string }
  | { type: "EXISTING_PEER"; userId: string }
  | { type: "PEER_LEFT"; userId: string }
  | { type: "ROOM_FULL" }
  | { type: "OFFER"; roomId: string; from: string; to: string; sdp: RTCSessionDescriptionInit }
  | { type: "ANSWER"; roomId: string; from: string; to: string; sdp: RTCSessionDescriptionInit }
  | { type: "ICE"; roomId: string; from: string; to: string; candidate: RTCIceCandidateInit };

type Room = Map<string, WebSocket>;
const rooms = new Map<string, Room>();

type RoomSocket = WebSocket & {
  roomId?: string;
  userId?: string;
};

wss.on("connection", (socket: RoomSocket) => {
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

        // Room full
        if (room.size >= 2) {
          socket.send(JSON.stringify({ type: "ROOM_FULL" }));
          socket.close();
          return;
        }

        // Tell new user about existing peer
        if (room.size === 1) {
          const [existingUserId] = room.keys();
          socket.send(
            JSON.stringify({
              type: "EXISTING_PEER",
              userId: existingUserId,
            })
          );
        }

        // Add user
        room.set(userId, socket);
        socket.roomId = roomId;
        socket.userId = userId;

        // Notify existing peer
        room.forEach((client, uid) => {
          if (uid !== userId) {
            client.send(
              JSON.stringify({
                type: "PEER_JOINED",
                userId,
              })
            );
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
    const { roomId, userId } = socket;
    if (!roomId || !userId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    room.delete(userId);

    room.forEach((client) => {
      client.send(
        JSON.stringify({
          type: "PEER_LEFT",
          userId,
        })
      );
    });

    if (room.size === 0) {
      rooms.delete(roomId);
    }
  });
});
