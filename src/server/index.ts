import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({port: 8080});

type signalMessage = {messageType: "JOIN_ROOM", roomId: string, userId: string}
| {messageType: "OFFER", roomId: string, userId: string}
| {messageType: "ANSWER", roomId: string, userId: string}
| {messageType: "ICE", roomId: string, userId: string}

const rooms = new Map<string, Set<WebSocket>>()

wss.on("connection", (socket: WebSocket) => {
  console.log("Client connected")
  socket.on("message", (data) => {
    const msg = JSON.parse(data.toString());

    switch (msg.type) {
      case "JOIN_ROOM": {
        const { roomId } = msg;

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }

        rooms.get(roomId)!.add(socket);
        (socket as any).roomId = roomId;

        console.log(`Client joined room ${roomId}`);
        break;
      }

      case "OFFER":
      case "ANSWER":
      case "ICE": {
        const { roomId } = msg;
        const clients = rooms.get(roomId);

        if (!clients) return;

        clients.forEach((client) => {
          if (client !== socket && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
          }
        });

        break;
      }
    }
  });

  socket.on("close", () => {
    const roomId = (socket as any).roomId;
    if (!roomId) return;

    const clients = rooms.get(roomId);
    if (!clients) return;

    clients.delete(socket);

    if (clients.size === 0) {
      rooms.delete(roomId);
    }

    console.log(`Client left room ${roomId}`);
  });


  socket.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
})    