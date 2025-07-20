"use client"
import { Button } from "@/components/ui/button"
import { signIn }  from "next-auth/react"

export default function Home() {
  return (
    <div className="h-screen w-screen">
      <nav className="h-[10vh] w-screen px-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold italic">x00m</h1>
        <Button onClick={() => signIn()}>Login</Button>
      </nav>
      <div className="h-[90vh] w-screen flex items-center justify-center">
        <h1 className="text-3xl italic">Video Call + Sketch + Coding labs</h1>
      </div>
    </div>
  );
}