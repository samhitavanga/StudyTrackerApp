import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's ID */
      id: string;
    } & DefaultSession['user'];
    /** The JWT token from Strapi */
    jwt: string;
  }

  interface User {
    /** The user's ID */
    id: string;
    /** The JWT token from Strapi */
    jwt: string;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken` */
  interface JWT {
    /** The user's ID */
    id: string;
    /** The JWT token from Strapi */
    jwt: string;
  }
}
