import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type CardTooltipProps = {
  title: string;
  color: string;
  text: string;
};

export const CardTooltip = ({ text, color, title }: CardTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className={`absolute top-2 cursor-pointer right-2 w-fit flex items-center px-2 gap-2 rounded-full border border-${color}-500 text-${color}-500 bg-transparent text-sm md:text-md`}
        >
          <span
            className={`h-2 w-2 rounded-full bg-${color}-500 inline-block`}
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
