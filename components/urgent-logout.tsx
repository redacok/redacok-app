"use client";

import { signOutUser } from "@/app/(auth)/sign-in/actions";
import { Button } from "./ui/button";

export const UrgentLogout = () => {
  return (
    <Button className="z-50" onClick={async () => signOutUser()}>
      Debuging Logout
    </Button>
  );
};
