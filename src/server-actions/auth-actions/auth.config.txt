export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  providers: [],
  callbacks: {
    // FOR MORE DETAIL ABOUT CALLBACK FUNCTIONS CHECK https://next-auth.js.org/configuration/callbacks
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.co_user_id;
        token.isAdmin = user.role_id == 1;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
    authorized: async ({ auth, request }) => {
      const user = auth?.user;
      const isInUsers = request.nextUrl?.pathname.startsWith("/users");
      const isOnAuthPages = request.nextUrl?.pathname.startsWith("/auth");

      // ONLY ADMIN CAN REACH GO TO USERS ON DASHBOARD

      if (isInUsers && !user?.isAdmin) {
        return false;
      }

      // ONLY UNAUTHENTICATED USERS CAN REACH THE AUTH PAGES

      if (isOnAuthPages && user) {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      return true;
    },
  },
};
