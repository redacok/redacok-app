import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { DoorOpen } from "lucide-react";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await auth();
  return (
    <div className="flex flex-col gap-y-4">
      <h1 className="font-semibold text-2xl">Dashboard</h1>
      <h1 className="font-semibold text-xl">
        Bienvenu Mr/Mme {session?.user.name}
      </h1>
      {/* {JSON.stringify(session?.user)} */}
      <form action={logout}>
        <Button type="submit">
          <DoorOpen className="size-5 mr-3" /> Se déconnecter
        </Button>
      </form>
    </div>
  );
};

async function logout() {
  "use server";
  await signOut();
  return redirect("/");
}

export default page;
