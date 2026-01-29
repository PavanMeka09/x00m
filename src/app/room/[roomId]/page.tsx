import { auth } from "@/app/auth";
import { redirect } from "next/navigation";

type Props = {
  params: {
    roomId: string;
  };
};

export default async function RoomPage({ params }: Props) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <div>
      <h1>Room: {params.roomId}</h1>
      <p>Welcome {session.user?.name}</p>
    </div>
  );
}