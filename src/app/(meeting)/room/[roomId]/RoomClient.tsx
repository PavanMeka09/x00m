"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Copy,
  Check,
  PhoneOff,
  Users,
  Loader2,
  Paintbrush,
  Eraser,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const router = useRouter();

  const wsRef = useRef<WebSocket | null>(null);
  const userIdRef = useRef<string | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const iceQueueRef = useRef<RTCIceCandidateInit[]>([]);

  // Canvas Refs & Drawing Tracker
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const [state, setState] = useState<RoomState>("INIT");
  const [peerId, setPeerId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isPeerMuted, setIsPeerMuted] = useState(false);
  const [isPeerCameraOff, setIsPeerCameraOff] = useState(false);
  const [copied, setCopied] = useState(false);

  const isMutedRef = useRef(false);
  const isCameraOffRef = useRef(false);

  // Canvas Config State
  const [color, setColor] = useState("#ef4444"); // Default brush: Red
  const [lineWidth, setLineWidth] = useState(3);

  // generate userId and request user media ONLY on client, after mount
  useEffect(() => {
    userIdRef.current = crypto.randomUUID().slice(0, 8);
    setMounted(true);

    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error getting user media:", err);
      }
    }

    initMedia();

    return () => {
      // Clean up local media tracks on unmount
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  // drawing helper
  const drawLine = useCallback(
    (
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      colorVal: string,
      widthVal: number,
      emit: boolean
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.beginPath();
      ctx.strokeStyle = colorVal;
      ctx.lineWidth = widthVal;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.moveTo(x0 * canvas.width, y0 * canvas.height);
      ctx.lineTo(x1 * canvas.width, y1 * canvas.height);
      ctx.stroke();

      if (emit && wsRef.current && wsRef.current.readyState === WebSocket.OPEN && peerId) {
        wsRef.current.send(
          JSON.stringify({
            type: "DRAW",
            roomId,
            from: userIdRef.current,
            to: peerId,
            x0,
            y0,
            x1,
            y1,
            color: colorVal,
            lineWidth: widthVal,
          })
        );
      }
    },
    [roomId, peerId]
  );

  const clearCanvas = useCallback(
    (emit: boolean) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#18181b"; // matches bg-zinc-900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (emit && wsRef.current && wsRef.current.readyState === WebSocket.OPEN && peerId) {
        wsRef.current.send(
          JSON.stringify({
            type: "CLEAR",
            roomId,
            from: userIdRef.current,
            to: peerId,
          })
        );
      }
    },
    [roomId, peerId]
  );

  // Canvas resize hook - saves canvas drawing, resizes, and draws it back
  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#18181b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          tempCanvas,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [mounted]);

  // Initialize peer connection helper
  const createPeerConnection = useCallback(
    async (targetPeerId: string, isOfferer: boolean) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      peerConnectionRef.current = pc;

      // Attach local stream tracks
      const stream = localStreamRef.current;
      if (stream) {
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      }

      // Handle track event from remote peer
      pc.ontrack = (event) => {
        console.log("Received remote track:", event.streams[0]);
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates generated locally
      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "ICE",
              roomId,
              from: userIdRef.current,
              to: targetPeerId,
              candidate: event.candidate,
            })
          );
        }
      };

      // Connection state changes
      pc.onconnectionstatechange = () => {
        console.log("Connection state changed:", pc.connectionState);
        if (pc.connectionState === "connected") {
          setState("CONNECTED");
        } else if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed"
        ) {
          setState("DISCONNECTED");
        }
      };

      // If we are the offerer, create the offer
      if (isOfferer) {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: "OFFER",
                roomId,
                from: userIdRef.current,
                to: targetPeerId,
                sdp: offer,
              })
            );
          }
        } catch (err) {
          console.error("Failed to create offer:", err);
        }
      }
    },
    [roomId]
  );

  // Connect to WebSocket signaling server
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

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);

      const processIceQueue = async (pc: RTCPeerConnection) => {
        if (iceQueueRef.current.length > 0) {
          for (const candidate of iceQueueRef.current) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.error("Error adding queued ice candidate:", e);
            }
          }
          iceQueueRef.current = [];
        }
      };

      switch (msg.type) {
        case "EXISTING_PEER":
          setPeerId(msg.userId);
          setState("NEGOTIATING");
          await createPeerConnection(msg.userId, false);
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: "PEER_STATE",
                roomId,
                from: userIdRef.current,
                to: msg.userId,
                isMuted: isMutedRef.current,
                isCameraOff: isCameraOffRef.current,
              })
            );
          }
          break;

        case "PEER_JOINED":
          setPeerId(msg.userId);
          setState("NEGOTIATING");
          await createPeerConnection(msg.userId, true);
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: "PEER_STATE",
                roomId,
                from: userIdRef.current,
                to: msg.userId,
                isMuted: isMutedRef.current,
                isCameraOff: isCameraOffRef.current,
              })
            );
          }
          break;

        case "OFFER": {
          const pc = peerConnectionRef.current;
          if (pc && pc.signalingState === "stable") {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            await processIceQueue(pc);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "ANSWER",
                  roomId,
                  from: userIdRef.current,
                  to: msg.from,
                  sdp: answer,
                })
              );
            }
          }
          break;
        }

        case "ANSWER": {
          const pc = peerConnectionRef.current;
          if (pc && pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            await processIceQueue(pc);
          }
          break;
        }

        case "ICE": {
          const pc = peerConnectionRef.current;
          if (pc && pc.remoteDescription) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
            } catch (e) {
              console.error("Error adding ice candidate", e);
            }
          } else {
            iceQueueRef.current.push(msg.candidate);
          }
          break;
        }

        case "DRAW":
          drawLine(
            msg.x0,
            msg.y0,
            msg.x1,
            msg.y1,
            msg.color,
            msg.lineWidth,
            false
          );
          break;

        case "CLEAR":
          clearCanvas(false);
          break;

        case "PEER_STATE":
          setIsPeerMuted(msg.isMuted);
          setIsPeerCameraOff(msg.isCameraOff);
          break;

        case "PEER_LEFT":
          setPeerId(null);
          setRemoteStream(null);
          setIsPeerMuted(false);
          setIsPeerCameraOff(false);
          iceQueueRef.current = [];
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
          }
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
  }, [mounted, roomId, createPeerConnection, drawLine, clearCanvas]);

  // Handle local video/audio mute toggles
  const toggleMute = () => {
    let stream = localStreamRef.current;
    if (!stream && localVideoRef.current) {
      stream = localVideoRef.current.srcObject as MediaStream;
    }

    if (stream) {
      const newMuted = !isMuted;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !newMuted;
      });
      setIsMuted(newMuted);
      isMutedRef.current = newMuted;

      // Broadcast state to peer
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && peerId) {
        wsRef.current.send(
          JSON.stringify({
            type: "PEER_STATE",
            roomId,
            from: userIdRef.current,
            to: peerId,
            isMuted: newMuted,
            isCameraOff: isCameraOffRef.current,
          })
        );
      }
    }
  };

  const toggleCamera = () => {
    let stream = localStreamRef.current;
    if (!stream && localVideoRef.current) {
      stream = localVideoRef.current.srcObject as MediaStream;
    }

    if (stream) {
      const newCameraOff = !isCameraOff;
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !newCameraOff;
      });
      setIsCameraOff(newCameraOff);
      isCameraOffRef.current = newCameraOff;

      // Broadcast state to peer
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && peerId) {
        wsRef.current.send(
          JSON.stringify({
            type: "PEER_STATE",
            roomId,
            from: userIdRef.current,
            to: peerId,
            isMuted: isMutedRef.current,
            isCameraOff: newCameraOff,
          })
        );
      }
    }
  };

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const leaveRoom = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    router.replace("/");
  };

  // Canvas Drawing Handlers
  const getRelativeCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const coords = getRelativeCoords(e);
    lastPosRef.current = coords;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const coords = getRelativeCoords(e);
    const lastPos = lastPosRef.current;

    drawLine(lastPos.x, lastPos.y, coords.x, coords.y, color, lineWidth, true);
    lastPosRef.current = coords;
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  // prevent SSR/client mismatch completely
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-hidden h-screen">
      {/* Top Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold italic tracking-wider text-white">x00m</h1>
          <div className="h-4 w-px bg-zinc-800" />
          <span className="text-sm font-medium text-zinc-400">
            Room: <span className="text-zinc-200 font-mono">{roomId}</span>
          </span>
        </div>

        {/* Room State Badges */}
        <div className="flex items-center gap-2">
          {state === "CONNECTED" ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected
            </span>
          ) : state === "WAITING_FOR_PEER" ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Waiting for Peer
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Loader2 className="h-3 w-3 animate-spin" />
              {state}
            </span>
          )}
          <span className="text-xs text-zinc-400 bg-zinc-800/80 px-3 py-1 rounded-full border border-zinc-700/50">
            {user.name}
          </span>
        </div>
      </header>

      {/* Workspace Split */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side: Videos Sidebar */}
        <section className="w-full lg:w-80 border-r border-zinc-800 bg-zinc-950/20 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
          {/* Local Video Card */}
          <div className="relative aspect-video rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-md group transition-all duration-300 hover:border-zinc-700">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isCameraOff ? "opacity-0" : "opacity-100"
              }`}
            />
            {isCameraOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
                <VideoOff className="h-6 w-6 text-zinc-400 mb-1" />
                <p className="text-xs">Camera Off</p>
              </div>
            )}
            {isMuted && (
              <div className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-lg shadow-md border border-red-400/20">
                <MicOff className="h-3.5 w-3.5" />
              </div>
            )}
            <div className="absolute top-2 left-2 bg-zinc-950/70 backdrop-blur-md px-2 py-1 rounded-lg border border-zinc-800/50 text-[10px] font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              You
            </div>
          </div>

          {/* Remote Video Card */}
          <div className="relative aspect-video rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-md group transition-all duration-300 hover:border-zinc-700">
            {remoteStream ? (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isPeerCameraOff ? "opacity-0" : "opacity-100"
                  }`}
                />
                {isPeerCameraOff && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500">
                    <VideoOff className="h-6 w-6 text-zinc-400 mb-1" />
                    <p className="text-xs">Camera Off</p>
                  </div>
                )}
                {isPeerMuted && (
                  <div className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-lg shadow-md border border-red-400/20">
                    <MicOff className="h-3.5 w-3.5" />
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 p-2 text-center">
                <Users className="h-6 w-6 text-amber-500 mb-1 animate-pulse" />
                <p className="text-xs font-medium">Waiting for peer...</p>
              </div>
            )}
            {remoteStream && (
              <div className="absolute top-2 left-2 bg-zinc-950/70 backdrop-blur-md px-2 py-1 rounded-lg border border-zinc-800/50 text-[10px] font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Peer ({peerId})
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Shared Whiteboard Canvas */}
        <section className="flex-1 flex flex-col bg-zinc-900 overflow-hidden relative">
          {/* Canvas Wrapper */}
          <div className="flex-1 relative bg-zinc-900 overflow-hidden">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            />
          </div>

          {/* Whiteboard Controls Panel */}
          <div className="h-16 border-t border-zinc-800 bg-zinc-950/60 backdrop-blur-md flex items-center justify-between px-6 shrink-0 gap-4">
            {/* Colors toolbar */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              <span className="text-xs text-zinc-400 font-semibold mr-1 flex items-center gap-1 shrink-0">
                <Paintbrush className="h-3 w-3" /> Color:
              </span>
              {[
                { name: "Red", value: "#ef4444" },
                { name: "Blue", value: "#3b82f6" },
                { name: "Emerald", value: "#10b981" },
                { name: "Yellow", value: "#f59e0b" },
                { name: "Purple", value: "#a855f7" },
                { name: "White", value: "#ffffff" },
              ].map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`h-6 w-6 rounded-full border transition-transform duration-200 cursor-pointer hover:scale-110 shrink-0 ${
                    color === c.value
                      ? "ring-2 ring-zinc-300 scale-105 border-transparent"
                      : "border-zinc-700"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>

            {/* Brush size selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-zinc-400 font-semibold shrink-0">Size:</span>
              {[2, 4, 8, 16].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setLineWidth(sz)}
                  className={`h-6 px-2 rounded text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                    lineWidth === sz
                      ? "bg-zinc-100 text-zinc-950 border-white"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                  }`}
                  title={`${sz}px brush`}
                >
                  {sz}px
                </button>
              ))}
            </div>

            {/* Canvas Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Eraser Tool Toggle */}
              <Button
                onClick={() => setColor("#18181b")}
                variant="outline"
                className={`border-zinc-800 h-9 px-3 text-xs flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  color === "#18181b"
                    ? "bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                    : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                }`}
                title="Eraser"
              >
                <Eraser className="h-3.5 w-3.5" />
                Eraser
              </Button>

              {/* Clear Canvas */}
              <Button
                onClick={() => clearCanvas(true)}
                variant="outline"
                className="border-red-900/30 bg-red-950/10 text-red-400 hover:bg-red-950/20 h-9 px-3 text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Clear Whiteboard"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Board
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Control Bar */}
      <footer className="h-20 border-t border-zinc-800 bg-zinc-900/40 backdrop-blur-md flex items-center justify-center px-6 shrink-0">
        <div className="flex items-center gap-4">
          {/* Mute Button */}
          <Button
            onClick={toggleMute}
            size="icon"
            className={`h-12 w-12 rounded-full border transition-all duration-300 cursor-pointer ${
              isMuted
                ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {/* Camera Button */}
          <Button
            onClick={toggleCamera}
            size="icon"
            className={`h-12 w-12 rounded-full border transition-all duration-300 cursor-pointer ${
              isCameraOff
                ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>

          {/* Copy Link Button */}
          <Button
            onClick={copyLink}
            size="icon"
            className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all duration-300 cursor-pointer"
            title="Copy Invite Link"
          >
            {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
          </Button>

          {/* Leave Button */}
          <Button
            onClick={leaveRoom}
            size="icon"
            className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700 border border-red-500 text-white transition-all duration-300 cursor-pointer shadow-lg shadow-red-600/10"
            title="Leave Call"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
