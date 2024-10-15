import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { DoorOpen } from "lucide-react";

const page = async () => {
  const session = await auth();
  return (
    <div>
      {JSON.stringify(session?.user)}
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <Button type="submit">
          <DoorOpen className="size-5 mr-3" /> Se déconnecter
        </Button>
      </form>
    </div>
  );
};

export default page;
