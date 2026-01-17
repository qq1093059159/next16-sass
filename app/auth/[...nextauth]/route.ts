// import NextAuth from "next-auth"
// import GithubProvider from "next-auth/providers/github"
// import GoogleProvider from 'next-auth/providers/google'
// export const authOptions = {
//   providers: [
//     GithubProvider({
//       clientId: process.env.GITHUB_ID,
//       clientSecret: process.env.GITHUB_SECRET,
//     } as never),
//   ],
// }
// const handler = NextAuth({
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET
//     })
//   ]
// })
// export {handler as GET, handler as POST}
// export default NextAuth(authOptions)

import { handlers } from '@/auth';
export const { GET, POST } = handlers

