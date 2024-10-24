import Link from "next/link";
import { Button } from "../ui/button";

export type BackButtonProps = {
  href: string;
  label: string;
  className?: string;
};

export const BackButton = ({ label, href, className }: BackButtonProps) => {
  return (
    <Button
      variant="link"
      size="sm"
      className={`font-normal ${className}`}
      asChild
    >
      <Link href={href}>{label}</Link>
    </Button>
  );
};
