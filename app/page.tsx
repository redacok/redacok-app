import { SignInButton } from "@/components/auth/sign-in-button";
import { Button } from "@/components/ui/button";
import { SparklesCore } from "@/components/ui/sparkles";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative w-full bg-black flex flex-col gap-y-24 items-center justify-center overflow-hidden rounded-md">
      <div className="w-full absolute inset-0 h-full">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={2}
          className="w-full h-full bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-950"
          particleColor="#FFFFFF"
        />
      </div>
      <div className="flex flex-col gap-10 items-center">
        <h1 className="md:text-7xl text-3xl lg:text-6xl font-bold text-center sm:container px-6 text-white relative z-20">
          Bienvenu sur{" "}
          <span className="bg-gradient-to-tr from-neutral-500 via-neutral-50 to-neutral-700 inline-block text-transparent bg-clip-text">
            Redacok.
          </span>
        </h1>
        <p className="text-neutral-200 w-1/2 text-center z-20">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptates
          soluta laborum eius minus dignissimos illo facere temporibus earum,
          sit iusto!
        </p>
      </div>
      <SignInButton>
        <Button
          size={"lg"}
          variant="secondary"
          className="flex gap-2 hover:cursor-pointer z-50"
        >
          Commencer
          <ArrowRight />
        </Button>
      </SignInButton>
    </div>
  );
}
