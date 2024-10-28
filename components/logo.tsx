import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

export const Logo = ({
  className,
  size,
}: {
  className?: string;
  size?: string;
}) => {
  return (
    <Link
      href="/"
      className={cn(
        "rounded-md py-3 px-1 font-normal w-fit flex space-x-2 items-center text-slate-900 relative z-20",
        className && `${className}`
      )}
    >
      <div
        className={cn(
          "h-8 w-10 font-bold text-xl flex items-center justify-center bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0",
          size && `${size}`
        )}
      >
        R.
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "text-slate-900 dark:text-white whitespace-pre font-semibold text-xl ${size}",
          size && `${size}`
        )}
      >
        Redacok.
      </motion.span>
    </Link>
  );
};
export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-slate-900 py-1 relative z-20"
    >
      <div className="h-8 w-6 font-bold text-md flex items-center justify-center bg-slate-900 text-white dark:bg-white dark:text-black rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0">
        R.
      </div>
    </Link>
  );
};
