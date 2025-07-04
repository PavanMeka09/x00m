import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="h-screen w-screen">
      <nav className="h-[10vh] w-screen px-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold italic">x00m</h1>
        {/* <div className="border-2 p-10"></div> */}
        <Button>Signup</Button>
      </nav>
      <div className="h-[90vh] w-screen flex items-center justify-center">
        <h1 className="text-3xl italic">Video Call + Sketch + Coding labs</h1>
      </div>
    </div>
  );
}