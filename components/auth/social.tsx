import { signInSocial } from "@/app/(auth)/sign-in/actions";
import { FcGoogle } from "react-icons/fc";
import { Button } from "../ui/button";

export const Social = () => {
  return (
    <div className="flex flex-col justify-center mx-auto w-full">
      <p className="flex items-center mb-4 gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        ou continuez avec
      </p>
      <div className="flex flex-col items-center w-full gap-x-2">
        <Button
          size="lg"
          onClick={() => signInSocial("google")}
          variant={"outline"}
          className="flex gap-3 w-full"
        >
          <FcGoogle className="size-6" /> Continuer avec Google
        </Button>
      </div>
    </div>
  );
};
