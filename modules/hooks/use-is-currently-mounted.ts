import { useRef, useEffect } from "react";

export const useIsCurrentlyMounted = () => {
  const isCurrentlyMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isCurrentlyMountedRef.current = false;
    };
  }, []);
  return isCurrentlyMountedRef.current;
};
