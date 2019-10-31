import { useRef, useEffect, useState, SetStateAction, Dispatch } from "react";
import { useTheme, useMediaQuery } from "@material-ui/core";
import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";

export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const useBreakpoint = (
  breakpoint: Breakpoint,
  direction: "up" | "down"
) => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints[direction](breakpoint));
};

export type ScreenSize = "mobile" | "medium" | "large";
export const useScreenSize = (): ScreenSize => {
  const smDown = useBreakpoint("sm", "down");
  const lgUp = useBreakpoint("lg", "up");
  if (smDown) return "mobile";
  if (lgUp) return "large";
  return "medium";
};

export const useDeferredState = <T>(
  initialT: T,
  delay: number
): [T, T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(initialT);
  const [pendingValue, setPendingValue] = useState<T>(initialT);
  useEffect(() => {
    if (value !== pendingValue) {
      const id = setTimeout(() => {
        setValue(pendingValue);
      }, delay);
      return () => clearTimeout(id);
    }
  }, [pendingValue, value, setValue, delay]);
  return [value, pendingValue, setPendingValue];
};
