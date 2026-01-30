import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/userData";

type Props = {
  params: {
    roomId: string;
  };
};

export default async function RoomPage({ params }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div>
      <h1>Room: {params.roomId}</h1>
      <p>Welcome {user.name}</p>
    </div>
  );
}