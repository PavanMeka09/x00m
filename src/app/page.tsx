import LoginButton from "@/components/loginButton";
import { SessionProvider } from "next-auth/react"

export default function Home() {
  return (
    <SessionProvider>
      <div className="h-screen w-screen">
        <nav className="h-[10vh] w-screen px-10 flex items-center justify-between">
          <h1 className="text-3xl font-bold italic">x00m</h1>
          <LoginButton />
        </nav>
        <div className="h-[90vh] w-screen flex items-center justify-evenly text-2xl font-extralight">
          <span className="h-60 w-100 border-2 rounded flex justify-center items-center">Video Call</span>
          <span className="h-60 w-100 border-2 rounded flex justify-center items-center">Sketch</span>
          <span className="h-60 w-100 border-2 rounded flex justify-center items-center">Coding labs</span>
        </div>
      </div>
    </SessionProvider>
  );
}