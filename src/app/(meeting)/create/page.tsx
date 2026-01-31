"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function generateMeetingId() {
  return crypto.randomUUID().slice(0, 8);
}

export default function CreateMeetingPage() {
  const router = useRouter();

  useEffect(() => {
    const meetingId = generateMeetingId();
    router.replace(`/room/${meetingId}`);
  }, [router]);

  return (
      <h1>Creating meeting…</h1>
  );
}
