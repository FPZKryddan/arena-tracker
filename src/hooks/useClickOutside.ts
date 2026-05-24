import { useEffect, useRef } from "react";

const useClickOutside = <T extends HTMLElement>(
  enabled: boolean,
  onOutside: () => void
) => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!ref.current) return;
      if (ref.current.contains(event.target as Node)) return;
      onOutside();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOutside();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, onOutside]);

  return ref;
};

export default useClickOutside;
