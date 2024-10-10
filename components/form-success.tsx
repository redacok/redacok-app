import { CheckCircledIcon } from "@radix-ui/react-icons";

export type FormErrorProps = {
  message?: string;
};

export const FormSuccess = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <div className="bg-emerald-500/15 p-3 rounded-md gap-x-2 text-sm text-emerald-700 flex items-center">
      <CheckCircledIcon className="size-6" />
      <p>{message}</p>
    </div>
  );
};
