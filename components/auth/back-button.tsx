import Link from "next/link";
import { Button } from "../ui/button";

export type BackButtonProps = {
  href: string;
  label: string;
};

export const BackButton = ({ label, href }: BackButtonProps) => {
  return (
    <Button variant="link" size="sm" className="font-normal w-full" asChild>
      <Link href={href}>{label}</Link>
    </Button>
  );
};
