import { FaExclamationTriangle } from "react-icons/fa";

export const FormError = ({ message }: { message?: string }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-destructive text-sm">
      <FaExclamationTriangle className="h-4 w-4" />
      <p>{message}</p>
    </div>
  );
};
