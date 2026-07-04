"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { Button } from './ui/button'
import LoginButton from './loginButton'
import {
  Video,
  Plus,
  Keyboard,
  Sparkles,
  Zap,
  Lock,
  ArrowRight,
  Mic,
  MicOff,
  VideoOff,
  Share2,
  PhoneOff,
  Palette,
  PenTool,
  Square,
  Circle,
  MousePointer2,
  Copy,
  Check
} from 'lucide-react'

export default function Hero() {
  const { data: session } = useSession()
  const router = useRouter()
  
  // State for Room Join input
  const [meetingId, setMeetingId] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Interactive Mockup States
  const [micMuted, setMicMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [activeCanvasTool, setActiveCanvasTool] = useState<'pen' | 'square' | 'circle'>('pen')
  const [sketchExpanded, setSketchExpanded] = useState(false)

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanId = meetingId.trim().toLowerCase()
    if (cleanId.length === 8) {
      router.push(`/room/${cleanId}`)
    } else {
      setError('Meeting ID must be exactly 8 characters.')
    }
  }

  const handleCreate = () => {
    router.push('/create')
  }

  const copyDemoId = () => {
    navigator.clipboard.writeText('demo-room')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-200 overflow-x-hidden relative">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[180px] pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-neutral-950/70 border-b border-neutral-900/60 px-6 py-4 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Video className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            x00m
          </span>
        </div>

        <div className="flex items-center gap-4">
          {session && (
            <div className="hidden md:flex items-center gap-3 bg-neutral-900/60 border border-neutral-800/80 py-1.5 px-3 rounded-full">
              {session.user?.image ? (
                <img className="rounded-full h-6 w-6 border border-violet-500/20" src={session.user.image} alt="profile" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-violet-600/30 text-violet-400 flex items-center justify-center text-xs font-semibold">
                  {session.user?.name?.slice(0, 1)}
                </div>
              )}
              <span className="text-xs text-neutral-300 font-medium pr-1">{session.user?.name}</span>
            </div>
          )}
          <LoginButton />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 md:py-20 max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          
          {/* Left Column: Heading & Controls */}
          <div className="lg:col-span-5 flex flex-col text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 self-start animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span>Interactive Collaborative Rooms</span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Where teams meet,{' '}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                sketch & build
              </span>{' '}
              together.
            </h1>

            <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-xl">
              Bring your video calls and designs onto the same screen. Connect with low-latency WebRTC conferencing while co-creating on an infinite shared whiteboard.
            </p>

            <div className="pt-2">
              {session ? (
                <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-5 max-w-md">
                  <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Welcome back, {session.user?.name?.split(' ')[0]}
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={handleCreate} 
                      className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-6 shadow-lg shadow-violet-600/15 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer rounded-xl flex items-center justify-center gap-2"
                    >
                      <Plus className="h-5 w-5" />
                      Create a Meeting
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-neutral-800/80"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-neutral-950 px-2 text-neutral-500 font-mono">Or Join Existing</span>
                    </div>
                  </div>

                  <form onSubmit={handleJoin} className="space-y-3">
                    <div className="relative flex items-center">
                      <Keyboard className="absolute left-3.5 h-5 w-5 text-neutral-500" />
                      <input
                        type="text"
                        placeholder="Enter 8-character room ID"
                        value={meetingId}
                        onChange={(e) => {
                          setMeetingId(e.target.value.toLowerCase())
                          setError('')
                        }}
                        maxLength={8}
                        className="w-full bg-neutral-950 border border-neutral-800/90 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-neutral-600 text-neutral-200 font-mono tracking-wider"
                      />
                    </div>
                    {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
                    <Button 
                      type="submit" 
                      variant="outline" 
                      className="w-full border-neutral-800 hover:border-neutral-700 bg-neutral-900/20 hover:bg-neutral-900 text-neutral-300 hover:text-white font-medium py-3 rounded-xl cursor-pointer"
                    >
                      Join Meeting Room
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="bg-neutral-900/30 border border-neutral-900/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-6 max-w-md">
                  <div>
                    <h3 className="font-semibold text-neutral-200 mb-1">Get started instantly</h3>
                    <p className="text-sm text-neutral-400">Sign in with next-auth to start hosting calls and drawing with your teammates.</p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => signIn()} 
                      className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-6 shadow-lg shadow-violet-500/15 rounded-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      Sign In with Provider
                      <ArrowRight className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2 justify-center text-xs text-neutral-500 mt-1">
                      <Lock className="h-3 w-3" />
                      Secure authentication via next-auth
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Room Demo Mockup */}
          <div className="lg:col-span-7 w-full flex flex-col items-center">
            
            {/* Window Container */}
            <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col aspect-[16/10] relative group">
              
              {/* Window Title Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-neutral-950/80 border-b border-neutral-800/80">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                  <span>room_id:</span>
                  <span className="text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 flex items-center gap-1">
                    demo-room
                    <button 
                      onClick={copyDemoId}
                      className="hover:text-white cursor-pointer active:scale-95 transition-transform" 
                      title="Copy Room ID"
                    >
                      {copied ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                    </button>
                  </span>
                </div>
                <div className="w-12 text-right">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>

              {/* Window Content: Splits Screen between Video Grid and Canvas Sketch */}
              <div className="flex-grow flex relative overflow-hidden bg-neutral-950">
                
                {/* Video Call Pane (Left) */}
                <div className={`${sketchExpanded ? 'w-[0%] opacity-0' : 'w-[45%] border-r border-neutral-800/60'} h-full flex flex-col p-3 gap-3 bg-neutral-950 transition-all duration-500 ease-in-out overflow-hidden`}>
                  
                  {/* Participant 1: Sarah Miller */}
                  <div className="flex-1 bg-neutral-900/50 border border-neutral-800 rounded-xl relative overflow-hidden flex flex-col justify-center items-center group/video">
                    {/* Pulsing indicator ring for active speaker */}
                    <div className="absolute inset-0 border border-violet-500/40 rounded-xl animate-pulse pointer-events-none" />
                    
                    <div className="relative">
                      {/* Avatar */}
                      <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-fuchsia-600 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-fuchsia-500/10">
                        SM
                      </div>
                      {/* Speaker waves */}
                      <div className="absolute -bottom-1 -right-1 bg-violet-600 text-white rounded-full p-1 border border-neutral-900 flex items-center justify-center">
                        <Mic className="h-3 w-3" />
                      </div>
                    </div>
                    
                    {/* User name card */}
                    <span className="absolute bottom-2 left-2 text-[10px] font-medium bg-neutral-950/80 text-neutral-300 px-2 py-0.5 rounded-full border border-neutral-800 backdrop-blur-sm">
                      Sarah Miller (Designer)
                    </span>
                    
                    {/* Mock audio wave bar */}
                    <div className="absolute top-2 right-2 flex gap-0.5 items-end h-3">
                      <div className="w-[2px] bg-violet-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0.1s' }} />
                      <div className="w-[2px] bg-violet-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0.3s' }} />
                      <div className="w-[2px] bg-violet-400 rounded-full animate-bounce h-1.5" style={{ animationDelay: '0.5s' }} />
                    </div>
                  </div>

                  {/* Participant 2: Alex (You) */}
                  <div className="flex-1 bg-neutral-900/50 border border-neutral-800 rounded-xl relative overflow-hidden flex flex-col justify-center items-center">
                    {videoOff ? (
                      <div className="flex flex-col items-center justify-center text-neutral-500 gap-1.5">
                        <div className="h-14 w-14 rounded-full bg-neutral-800 flex items-center justify-center">
                          <VideoOff className="h-5 w-5" />
                        </div>
                        <span className="text-[10px]">Camera Muted</span>
                      </div>
                    ) : (
                      <>
                        <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-500/10">
                          A
                        </div>
                        {micMuted && (
                          <div className="absolute -bottom-1 -right-1 bg-red-500/90 text-white rounded-full p-1 border border-neutral-900 flex items-center justify-center">
                            <MicOff className="h-3 w-3" />
                          </div>
                        )}
                      </>
                    )}

                    <span className="absolute bottom-2 left-2 text-[10px] font-medium bg-neutral-950/80 text-neutral-300 px-2 py-0.5 rounded-full border border-neutral-800 backdrop-blur-sm">
                      Alex (You)
                    </span>
                  </div>
                </div>

                {/* Whiteboard Sketch Pane (Right/Full) */}
                <div className={`${sketchExpanded ? 'w-[100%]' : 'w-[55%]'} h-full flex flex-col relative transition-all duration-500 ease-in-out`}>
                  
                  {/* Grid canvas background */}
                  <div 
                    className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:14px_14px] opacity-60 pointer-events-none" 
                  />

                  {/* Canvas Sketch Toolbar */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-neutral-900/95 border border-neutral-800 px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 z-20 backdrop-blur-sm">
                    <button 
                      onClick={() => setActiveCanvasTool('pen')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${activeCanvasTool === 'pen' ? 'bg-violet-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                      title="Pen Tool"
                    >
                      <PenTool className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => setActiveCanvasTool('square')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${activeCanvasTool === 'square' ? 'bg-violet-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                      title="Rectangle"
                    >
                      <Square className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => setActiveCanvasTool('circle')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${activeCanvasTool === 'circle' ? 'bg-violet-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                      title="Circle"
                    >
                      <Circle className="h-3.5 w-3.5" />
                    </button>
                    <div className="w-[1px] h-4 bg-neutral-800 mx-1" />
                    <div className="flex gap-1">
                      <span className="w-3.5 h-3.5 rounded-full bg-violet-500 border border-white/20 cursor-pointer" />
                      <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 border border-white/20 cursor-pointer" />
                      <span className="w-3.5 h-3.5 rounded-full bg-pink-500 border border-white/20 cursor-pointer" />
                    </div>
                  </div>

                  {/* Draw Elements Mockup */}
                  <svg className="w-full h-full p-4 relative z-10 pointer-events-none">
                    <defs>
                      <linearGradient id="vector-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>

                    {/* Dotted drawing stroke */}
                    <path 
                      d="M 40,80 Q 80,40 120,90 T 240,60" 
                      fill="none" 
                      stroke="url(#vector-grad)" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                    />

                    {/* Flowchart Boxes */}
                    <rect x="25" y="125" width="80" height="35" rx="6" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
                    <text x="65" y="146" fill="#c7d2fe" fontSize="9" fontFamily="monospace" textAnchor="middle">Landing UI</text>

                    <rect x="155" y="125" width="80" height="35" rx="6" fill="#311042" stroke="#d946ef" strokeWidth="1.5" />
                    <text x="195" y="146" fill="#fbcfe8" fontSize="9" fontFamily="monospace" textAnchor="middle">WebRTC Call</text>

                    {/* Connecting Arrow */}
                    <path 
                      d="M 105,142.5 L 150,142.5" 
                      fill="none" 
                      stroke="#4b5563" 
                      strokeWidth="1.5" 
                      strokeDasharray="3 3"
                    />
                    <polygon points="150,139.5 155,142.5 150,145.5" fill="#4b5563" />

                    {/* Notes text */}
                    <text x="35" y="210" fill="#a3a3a3" fontSize="10" fontFamily="sans-serif">💡 Canvas syncs in real-time!</text>
                  </svg>

                  {/* Simulated Shared Cursors */}
                  <div className="absolute top-[80px] left-[150px] flex flex-col items-start z-20 pointer-events-none transition-all duration-1000">
                    <MousePointer2 className="h-4.5 w-4.5 text-pink-500 fill-pink-500 transform -rotate-90" />
                    <span className="bg-pink-500 text-white text-[8px] font-mono py-0.5 px-1 rounded-md shadow-md -mt-1 ml-3">
                      Sarah Miller
                    </span>
                  </div>

                  <div className="absolute top-[165px] left-[75px] flex flex-col items-start z-20 pointer-events-none transition-all duration-1000">
                    <MousePointer2 className="h-4.5 w-4.5 text-violet-500 fill-violet-500 transform -rotate-90" />
                    <span className="bg-violet-500 text-white text-[8px] font-mono py-0.5 px-1 rounded-md shadow-md -mt-1 ml-3">
                      Alex
                    </span>
                  </div>

                  <span className="absolute bottom-2 right-2 text-[9px] font-mono text-neutral-600 bg-neutral-900/60 px-2 py-0.5 rounded border border-neutral-800/40">
                    Sketch Canvas v1.0
                  </span>
                </div>
              </div>

              {/* Bottom Control Bar of Mockup App */}
              <div className="px-4 py-3.5 bg-neutral-950 border-t border-neutral-800/80 flex items-center justify-between z-20">
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setMicMuted(!micMuted)}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${micMuted ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white'}`}
                    title={micMuted ? "Unmute Mic" : "Mute Mic"}
                  >
                    {micMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <button 
                    onClick={() => setVideoOff(!videoOff)}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${videoOff ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white'}`}
                    title={videoOff ? "Start Camera" : "Stop Camera"}
                  >
                    {videoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                  </button>
                  <button 
                    className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-805 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Share Screen"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSketchExpanded(!sketchExpanded)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${sketchExpanded ? 'bg-violet-600 text-white' : 'bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white'}`}
                  >
                    <Palette className="h-3.5 w-3.5" />
                    {sketchExpanded ? 'Split Screen' : 'Canvas Focus'}
                  </button>
                  <button 
                    className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
                    title="Leave Call"
                  >
                    <PhoneOff className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Hint overlay to indicate interactivity */}
            <p className="text-[11px] font-mono text-neutral-500 mt-3 animate-pulse">
              * Try clicking the control buttons inside the mockup window above!
            </p>

          </div>

        </div>

        {/* Feature Grid */}
        <section className="w-full mt-24 md:mt-32 pt-16 border-t border-neutral-900/80">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Designed for interactive collaboration
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base">
              A comprehensive meeting solution featuring zero-install WebRTC tech stack built for modern speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            
            {/* Feature 1 */}
            <div className="bg-neutral-900/20 border border-neutral-900 hover:border-neutral-800/80 rounded-2xl p-6.5 hover:bg-neutral-900/30 transition-all duration-300 group flex flex-col space-y-4">
              <div className="h-10 w-10 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center border border-violet-500/10 group-hover:scale-105 transition-transform">
                <Video className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-200">Crystal Clear Video</h3>
              <p className="text-neutral-400 text-sm leading-relaxed flex-grow">
                Experience high-performance, low-latency 1-on-1 audio and video calling. Powered by modern WebRTC standard right inside your browser.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-neutral-900/20 border border-neutral-900 hover:border-neutral-800/80 rounded-2xl p-6.5 hover:bg-neutral-900/30 transition-all duration-300 group flex flex-col space-y-4">
              <div className="h-10 w-10 rounded-xl bg-fuchsia-600/10 text-fuchsia-400 flex items-center justify-center border border-fuchsia-500/10 group-hover:scale-105 transition-transform">
                <Palette className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-200">Real-time Sketchpad</h3>
              <p className="text-neutral-400 text-sm leading-relaxed flex-grow">
                Draw, outline layouts, or map architectures collaboratively. High-frequency coordinates sync over WebSockets for zero latency.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-neutral-900/20 border border-neutral-900 hover:border-neutral-800/80 rounded-2xl p-6.5 hover:bg-neutral-900/30 transition-all duration-300 group flex flex-col space-y-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-600/10 text-cyan-400 flex items-center justify-center border border-cyan-500/10 group-hover:scale-105 transition-transform">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-neutral-200">Instant Setup</h3>
              <p className="text-neutral-400 text-sm leading-relaxed flex-grow">
                No installations, no calendar invites needed. Just click &apos;Create Meeting&apos;, copy the room URL, and hand it to your colleague to start.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900/80 bg-neutral-950/80 py-10 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-400">x00m Workspace</span>
            <span className="text-xs text-neutral-600">•</span>
            <span className="text-xs text-neutral-500">Video Call + Real-time Canvas</span>
          </div>
          
          <p className="text-xs text-neutral-600">
            Powered by Next.js, Prisma, WebSockets & WebRTC. Built with ❤️.
          </p>
        </div>
      </footer>

    </div>
  )
}
