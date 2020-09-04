import { useEffect } from "react";

export function useKeyPress(
  key: Key,
  onPress: () => void,
  element: HTMLElement | null
) {
  const handleKeyDown = (e: Event) => {
    const pressedKey = (e as KeyboardEvent).key;

    if (key === "" || pressedKey === key) {
      e.stopPropagation();
      e.preventDefault();

      onPress();
    }
  };

  useEffect(() => {
    element?.addEventListener("keydown", handleKeyDown);

    return () => element?.removeEventListener("keydown", handleKeyDown);
  });

  return [];
}

// NOTE: add more here as needed
type Key = "" | "Escape" | "ArrowDown" | "ArrowUp" | "Enter";

export const ALL_KEYS: Key = "";
export const ESCAPE: Key = "Escape";
export const ENTER: Key = "Enter";
export const ARROW_DOWN: Key = "ArrowDown";
export const ARROW_UP: Key = "ArrowUp";
