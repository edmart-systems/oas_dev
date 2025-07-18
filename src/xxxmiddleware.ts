// import NextAuth from "next-auth";
// import { authOptions } from "./auth/auth";
// import { authConfig } from "./actions/auth-actions/auth.config";
import withAuth from "next-auth/middleware";

// export default NextAuth(authConfig).auth;

export default withAuth({
  // pages: authConfig.pages,
});

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next).*)"],
};

// FOR MORE INFORMATION CHECK: https://nextjs.org/docs/app/building-your-application/routing/middleware
