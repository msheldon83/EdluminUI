// Adapted from react-use-dimensions
import { useState, useCallback, useLayoutEffect } from "react";

export interface ScrollDimensionObject {
  scrollWidth?: number;
  scrollHeight?: number;
}

export type UseScrollDimensionsHook = [
  (node: HTMLElement | null) => void,
  ScrollDimensionObject,
  HTMLElement | null
];

export interface UseScrollDimensionsArgs {
  liveMeasure?: boolean;
}

function getScrollDimensions(node: HTMLElement | null): ScrollDimensionObject {
  if (!node) return {};
  return {
    scrollWidth: node.scrollWidth,
    scrollHeight: node.scrollHeight,
  };
}

export function useScrollDimensions({
  liveMeasure = true,
}: UseScrollDimensionsArgs = {}): UseScrollDimensionsHook {
  const [dimensions, setDimensions] = useState({});
  const [node, setNode] = useState<HTMLElement | null>(null);

  const ref = useCallback(node => {
    setNode(node);
  }, []);

  useLayoutEffect(() => {
    if (node) {
      const measure = () =>
        window.requestAnimationFrame(() =>
          setDimensions(getScrollDimensions(node))
        );
      measure();

      if (liveMeasure) {
        window.addEventListener("resize", measure);
        window.addEventListener("scroll", measure);

        return () => {
          window.removeEventListener("resize", measure);
          window.removeEventListener("scroll", measure);
        };
      }
    }
  }, [node, liveMeasure]);

  return [ref, dimensions, node];
}
