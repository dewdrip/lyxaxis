import { SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { RiArrowLeftLine } from "react-icons/ri";

export const BackButton = ({
  action,
  isRequiredPage = false,
}: {
  action: (value: SetStateAction<number>) => void;
  isRequiredPage?: boolean;
}) => {
  const router = useRouter();

  const handleClick = () => {
    isRequiredPage ? router.back() : action(prev => prev - 1);
  };

  return (
    <button
      onClick={handleClick}
      className="flex tems-center rounded-lg text-sm font-medium text-gray-700 transition-all"
    >
      <RiArrowLeftLine className="mr-1" size={20} />
      Back
    </button>
  );
};
