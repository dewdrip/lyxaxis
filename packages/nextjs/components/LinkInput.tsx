import { XMarkIcon } from "@heroicons/react/24/outline";
import { InputBase } from "~~/components/scaffold-eth";

interface LinkInputProps {
  title: string;
  url: string;
  onCancel: () => void;
  onChangeTitle: (title: string) => void;
  onChangeUrl: (url: string) => void;
}

export const LinkInput = ({ title, url, onCancel, onChangeTitle, onChangeUrl }: LinkInputProps) => {
  return (
    <div className="flex flex-col gap-2 bg-base-200 p-3 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Link</span>
        <button onClick={onCancel} className="hover:text-error">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <InputBase value={title} onChange={onChangeTitle} placeholder="Title" />
        <InputBase value={url} onChange={onChangeUrl} placeholder="https://" />
      </div>
    </div>
  );
};
