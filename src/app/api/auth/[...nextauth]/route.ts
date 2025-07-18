import { authOptions } from "@/server-actions/auth-actions/auth.actions";
import NextAuth from "next-auth/next";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
