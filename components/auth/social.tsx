import { signInSocial } from "@/app/(auth)/sign-in/actions";
import { FcGoogle } from "react-icons/fc";
import { Button } from "../ui/button";

export const Social = () => {
  return (
    <div className="flex items-center w-full gap-x-2">
      <Button
        size="lg"
        onClick={() => signInSocial("google")}
        variant={"outline"}
        className="flex gap-3 w-full"
      >
        <FcGoogle className="size-6" /> Continuer avec Google
      </Button>
    </div>
  );
};
