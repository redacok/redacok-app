import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Link from "next/link";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export type headerProps = {
  label: string;
};

export const Header = ({ label }: headerProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center">
      <Link href={"/"}>
        <h1 className={cn("text-3xl font-bold", font.className)}>Redacok.</h1>
      </Link>
      <p className="text-muted-foreground font-semibold">{label}</p>
    </div>
  );
};
