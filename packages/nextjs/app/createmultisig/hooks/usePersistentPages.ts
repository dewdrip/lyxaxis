import { useEffect, useState } from "react";

export function usePersistentPages(key = "pages") {
  const [pages, setPages] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(key);
      return stored ? Number(stored) : 0;
    }
    return 0;
  });

  useEffect(() => {
    localStorage.setItem(key, pages.toString());
  }, [pages, key]);

  return [pages, setPages] as const;
}
