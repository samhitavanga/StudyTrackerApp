import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          // Default to localhost:1337 if NEXT_PUBLIC_STRAPI_URL is not set
          const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
          console.log('Authenticating with Strapi at:', strapiUrl);

          try {
            // Authenticate with Strapi
            const response = await fetch(`${strapiUrl}/api/auth/local`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                identifier: credentials.email,
                password: credentials.password,
              }),
            });

            const data = await response.json();
            console.log('Strapi auth response status:', response.status);

            if (!response.ok) {
              console.error('Strapi authentication error:', data);
              throw new Error(data.error?.message || 'Invalid credentials');
            }

            console.log('Authentication successful, user ID:', data.user.id);

            // Store in localStorage as fallback
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', data.jwt);
              localStorage.setItem('user', JSON.stringify(data.user));
              localStorage.setItem('isLoggedIn', 'true');
            }

            // Return the user object
            return {
              id: data.user.id,
              name: data.user.username || data.user.email.split('@')[0],
              email: data.user.email,
              jwt: data.jwt,
            };
          } catch (fetchError) {
            console.error('Strapi connection error:', fetchError);
            
            // Check localStorage for fallback authentication
            if (typeof window !== 'undefined') {
              const storedUser = localStorage.getItem('user');
              const storedToken = localStorage.getItem('token');
              
              if (storedUser && storedToken) {
                try {
                  const user = JSON.parse(storedUser);
                  console.log('Using localStorage fallback for user:', user.id);
                  
                  // If credentials match the stored user, authenticate
                  if (user.email === credentials.email) {
                    return {
                      id: user.id,
                      name: user.username || user.email.split('@')[0],
                      email: user.email,
                      jwt: storedToken,
                    };
                  }
                } catch (parseError) {
                  console.error('Error parsing stored user:', parseError);
                }
              }
            }
            
            throw new Error('Could not connect to authentication server. Please try again later.');
          }
        } catch (error: any) {
          console.error('Authentication error:', error);
          throw new Error(error.message || 'Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        console.log('Setting JWT token for user:', user.id);
        return {
          ...token,
          id: user.id,
          jwt: user.jwt,
        };
      }
      // Return previous token if the access token has not expired yet
      return token;
    },
    async session({ session, token }) {
      // Add user ID and JWT to the session
      if (session.user) {
        session.user.id = token.id as string;
        session.jwt = token.jwt as string;
        console.log('Session updated with JWT token');
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};
