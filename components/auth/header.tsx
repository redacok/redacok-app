import { Poppins } from "next/font/google";
import { Logo } from "../logo";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export type headerProps = {
  label: string;
};

export const Header = ({ label }: headerProps) => {
  return (
    <div
      className={`${font.className} w-full flex flex-col gap-y-4 items-center`}
    >
      <div className="w-full flex items-center justify-center">
        <Logo size="text-3xl" />
      </div>
      <p className="text-muted-foreground font-semibold">{label}</p>
    </div>
  );
};
