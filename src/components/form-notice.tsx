import { CheckIcon } from "lucide-react";
import { FaExclamationTriangle } from "react-icons/fa";

export const FormNotice = ({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) => {
  if (!(error || success)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-destructive text-sm">
          <FaExclamationTriangle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-x-2 rounded-md bg-emerald-500/15 p-3 text-emerald-500 text-sm">
          <CheckIcon className="h-4 w-4" />
          <p>{success}</p>
        </div>
      )}
    </div>
  );
};
