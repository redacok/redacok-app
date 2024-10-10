"use client";

import { useRouter } from "next/navigation";

interface LoginButtonProps {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
}

export const SignInButton = ({ children, mode }: LoginButtonProps) => {
  const router = useRouter();

  const onClick = () => {
    router.push("/sign-in");
  };

  if (mode === "modal") {
    return <span>TOTO: implement Modal</span>;
  }

  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
};
