import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/userData";
import RoomClient from "./RoomClient";

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
    <RoomClient
      roomId={params.roomId}
      user={{
        email: user.email,
        name: user.name,
      }}
    />
  );
}
