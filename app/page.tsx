import { SignInButton } from "@/components/auth/sign-in-button";
import { Button } from "@/components/ui/button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export default function Home() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <SignInButton>
        <Button variant="secondary" className="flex gap-2">
          <GitHubLogoIcon />
          Se Connecter
        </Button>
      </SignInButton>
    </div>
  );
}
