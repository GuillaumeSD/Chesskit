// User Authentication Service Example with NextAuth.js
import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

export default NextAuth({
  providers: [
    Providers.Credentials({
      name: 'Credentials',
      authorize: async (credentials) => {
        // Validate user credentials
        const user = await getUser(credentials.email, credentials.password);
        if (user) {
          return user;
        }
        return null;
      }
    })
  ],
  session: {
    jwt: true,
  },
});
