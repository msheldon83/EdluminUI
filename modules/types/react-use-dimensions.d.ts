declare module "react-use-dimensions" {
  export interface DimensionObject {
    width?: number;
    height?: number;
    top?: number;
    left?: number;
    x?: number;
    y?: number;
    right?: number;
    bottom?: number;
  }

  export type UseDimensionsHook = [
    (node: HTMLElement | null) => void,
    DimensionObject,
    HTMLElement
  ];

  export interface UseDimensionsArgs {
    liveMeasure?: boolean;
  }

  export function getDimensionObject(node: HTMLElement): DimensionObject;

  function useDimensions(args?: UseDimensionsArgs): UseDimensionsHook;

  export default useDimensions;
}
