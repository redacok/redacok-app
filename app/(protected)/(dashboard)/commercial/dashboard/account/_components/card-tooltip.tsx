import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type CardTooltipProps = {
  title: string;
  type: string;
  text: string;
};

export const CardTooltip = ({
  text,
  type = "default",
  title,
}: CardTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className={`absolute top-2 cursor-pointer right-2 w-fit flex items-center px-2 gap-2 rounded-full border ${
            type === "danger"
              ? "border-red-500 text-red-500"
              : type === "warning"
              ? "border-yellow-500 text-yellow-500"
              : "border-slate-800 text-slate-800"
          } bg-transparent text-sm md:text-md`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              type === "danger"
                ? "bg-red-500"
                : type === "warning"
                ? "bg-yellow-500"
                : "bg-slate-800"
            } inline-block`}
          />{" "}
          {title}
        </TooltipTrigger>
        <TooltipContent>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
