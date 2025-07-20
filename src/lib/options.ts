import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';
import { Session, SessionStrategy } from 'next-auth';

export const options = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture
        }
      },
    })
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/signin',
    verifyRequest: '/auth/signin',
  },
  session: {
    strategy: "jwt" as SessionStrategy
  },
  callbacks: {
    async session({ token, session }: {token: JWT, session: Session}) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    }
  }
}