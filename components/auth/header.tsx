import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";

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
      <h1 className={cn("text-3xl font-semibold", font.className)}>Redacok.</h1>
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
};
