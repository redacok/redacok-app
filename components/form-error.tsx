import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export type FormErrorProps = {
  message?: string;
};

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <div className="bg-destructive/15 p-3 rounded-md gap-x-2 text-sm text-destructive flex items-center">
      <ExclamationTriangleIcon className="size-6" />
      <p>{message}</p>
    </div>
  );
};
