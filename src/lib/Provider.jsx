'use client';

import { SessionProvider } from "next-auth/react";



const Provider = ({ children, session = null}) => (
  <SessionProvider session={session}>
    {children}
  </SessionProvider>
)

export default Provider;