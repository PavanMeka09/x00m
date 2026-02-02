"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  roomId: string;
  user: {
    id: string;
    name: string;
  };
};

type RoomState =
  | "INIT"
  | "CONNECTING_WS"
  | "JOINED"
  | "WAITING_FOR_PEER"
  | "NEGOTIATING"
  | "CONNECTED"
  | "DISCONNECTED";

export default function RoomClient({ roomId, user }: Props) {
  const wsRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<RoomState>("INIT");
  const [peerId, setPeerId] = useState<string | null>(null);

  useEffect(() => {
    setState("CONNECTING_WS");

    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          roomId,
          userId: user.id,
        })
      );
      setState("JOINED");
      setState("WAITING_FOR_PEER");
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case "PEER_JOINED":
          setPeerId(msg.userId);
          setState("NEGOTIATING");
          break;

        case "PEER_LEFT":
          setPeerId(null);
          setState("WAITING_FOR_PEER");
          break;
      }
    };

    ws.onclose = () => {
      setState("DISCONNECTED");
    };

    return () => {
      ws.close();
    };
  }, [roomId, user.id]);

  return (
    <div>
      <h1>Room: {roomId}</h1>

      <p>
        <b>User:</b> {user.name} ({user.id})
      </p>

      <p>
        <b>State:</b> {state}
      </p>

      <p>
        <b>Peer:</b> {peerId ?? "none"}
      </p>

      {state === "WAITING_FOR_PEER" && (
        <p>Waiting for someone to join…</p>
      )}

      {state === "NEGOTIATING" && (
        <p>Peer joined. Preparing connection…</p>
      )}

      {state === "CONNECTED" && <p>Connected ✅</p>}
    </div>
  );
}
