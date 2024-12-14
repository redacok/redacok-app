import { auth } from "@/auth";
import { DashboardButton } from "@/components/auth/dashboard-button";
import { Navbar } from "@/components/navbar";
import { SparklesCore } from "@/components/ui/sparkles";
import { UrgentLogout } from "@/components/urgent-logout";
import { db } from "@/lib/db";

export default async function Home() {
  const session = await auth();

  let urgent = false;
  if (session?.user) {
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      urgent = true;
    }
  }
  return (
    <div className="min-h-screen relative w-full bg-black flex flex-col items-center justify-center">
      <Navbar session={session?.user} />
      <div className="min-h-screen relative w-full flex flex-col gap-y-24 items-center justify-center overflow-hidden">
        <div className="w-full absolute inset-0 h-full">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={3.4}
            particleDensity={5}
            className="w-full h-full bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-950"
            particleColor="#FFFFFF"
          />
        </div>
        <div className="flex flex-col gap-10 items-center">
          <h1 className="md:text-7xl sm:text-6xl text-5xl font-bold text-center sm:container px-6 text-white relative z-20">
            Bienvenu sur{" "}
            <span className="bg-gradient-to-tr from-neutral-500 via-neutral-50 to-neutral-700 inline-block text-transparent bg-clip-text">
              Redacok.
            </span>
          </h1>
          <p className="text-neutral-200 p-4 w-full md:w-1/2 text-center z-20">
            votre solution d&apos;épargne innovante avec un rendement garanti de
            10%
          </p>
        </div>
        <DashboardButton label="Commencer" session={session?.user} />
        {urgent && <UrgentLogout />}
      </div>
    </div>
  );
}
