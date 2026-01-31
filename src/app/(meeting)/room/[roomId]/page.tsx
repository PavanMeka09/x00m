import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/userData";

type Props = {
  params: Promise<{
    roomId: string;
  }>;
};

export default async function RoomPage({ params }: Props) {
  const { roomId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div>
      <h1>Room: {roomId}</h1>
      <p>Welcome {user.name}</p>
    </div>
  );
}
