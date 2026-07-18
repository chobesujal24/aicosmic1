"use client";

import { firebaseAuth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export const SignOutForm = () => {
  const router = useRouter();

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await firebaseAuth.signOut();
      document.cookie = "firebaseIdToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <form onSubmit={handleSignOut} className="w-full">
      <button className="w-full px-1 py-0.5 text-left text-red-500" type="submit">
        Sign out
      </button>
    </form>
  );
};
