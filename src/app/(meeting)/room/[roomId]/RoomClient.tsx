"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  roomId: string;
  user: {
    name: string;
    email: string;
  };
};

type RoomState =
  | "INIT"
  | "CONNECTING_WS"
  | "WAITING_FOR_PEER"
  | "NEGOTIATING"
  | "CONNECTED"
  | "DISCONNECTED";

export default function RoomClient({ roomId, user }: Props) {
  const wsRef = useRef<WebSocket | null>(null);
  const userIdRef = useRef<string | null>(null);

  const [state, setState] = useState<RoomState>("INIT");
  const [peerId, setPeerId] = useState<string | null>(null);
  const [role, setRole] = useState<"OFFERER" | "ANSWERER" | null>(null);
  const [mounted, setMounted] = useState(false);

  // ✅ generate userId ONLY on client, after mount
  useEffect(() => {
    userIdRef.current = crypto.randomUUID().slice(0, 8);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !userIdRef.current) return;

    setState("CONNECTING_WS");

    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          roomId,
          userId: userIdRef.current,
        })
      );

      setState("WAITING_FOR_PEER");
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case "EXISTING_PEER":
          setPeerId(msg.userId);
          setRole("ANSWERER");
          setState("NEGOTIATING");
          break;

        case "PEER_JOINED":
          setPeerId(msg.userId);
          setRole("OFFERER");
          setState("NEGOTIATING");
          break;

        case "PEER_LEFT":
          setPeerId(null);
          setRole(null);
          setState("WAITING_FOR_PEER");
          break;

        case "ROOM_FULL":
          alert("Room already has 2 participants");
          ws.close();
          break;
      }
    };

    ws.onclose = () => {
      setState("DISCONNECTED");
    };

    return () => {
      ws.close();
    };
  }, [mounted, roomId]);

  // ✅ prevent SSR/client mismatch completely
  if (!mounted) {
    return null;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Room: {roomId}</h1>

      <p>
        <b>User:</b> {user.name}
      </p>

      <p>
        <b>User ID:</b> {userIdRef.current}
      </p>

      <p>
        <b>State:</b> {state}
      </p>

      <p>
        <b>Peer:</b> {peerId ?? "none"}
      </p>

      <p>
        <b>Role:</b> {role ?? "undecided"}
      </p>

      {state === "WAITING_FOR_PEER" && (
        <p>Waiting for someone to join…</p>
      )}

      {state === "NEGOTIATING" && (
        <p>Peer detected. Role = {role}. Preparing connection…</p>
      )}
    </div>
  );
}
