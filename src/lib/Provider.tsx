'use client';

import { SessionProvider } from "next-auth/react";

interface LayoutProps {
  children: React.ReactNode;
  session: any; // Replace `any` with the appropriate type if available
}



const Provider: React.FC<LayoutProps> = ({ children, session }) => (
  <SessionProvider session={session}>
    {children}
  </SessionProvider>
)

export default Provider;