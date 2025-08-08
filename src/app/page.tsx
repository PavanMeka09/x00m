import Hero from "@/components/hero";
import { SessionProvider } from "next-auth/react"

export default function Home() {
  return (
    <SessionProvider>
      <Hero />
    </SessionProvider>
  );
}