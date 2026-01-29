import NextAuth from "next-auth";
import { authOptions } from "@/app/auth";

const { handlers } = NextAuth(authOptions);

export const GET = handlers.GET
export const POST = handlers.POST