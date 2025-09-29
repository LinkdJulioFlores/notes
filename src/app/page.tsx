"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import HomeComponent from "./_components/HomeComponent";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div>
      {session && <HomeComponent />}
      <div>
        <button
          onClick={
            session
              ? async () => { await signOut(); }
              : async () => { await signIn(); }
          }
        >
          {session ? "Sign out" : "Sign in"}
        </button>
      </div>
    </div>
  );
}
