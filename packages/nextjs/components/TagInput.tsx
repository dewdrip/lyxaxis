import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface TagInputProps {
  onAdd: (tag: string) => void;
  onDelete: (tag: string) => void;
  tags: string[];
}

export const TagInput = ({ onAdd, onDelete, tags }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      onAdd(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <div key={index} className="flex items-center gap-1 bg-base-200 px-3 py-1 rounded-full text-sm">
            <span>{tag}</span>
            <button onClick={() => onDelete(tag)} className="hover:text-error">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type and press Enter to add a tag"
        className="input input-ghost focus-within:border-gray focus:outline-none focus:bg-transparent h-[3rem] min-h-[2.2rem] px-4 border border-gray bg-base-200 rounded text-accent w-full font-medium placeholder:text-accent/70 text-base-content/70 focus:text-base-content/70"
      />
    </div>
  );
};
