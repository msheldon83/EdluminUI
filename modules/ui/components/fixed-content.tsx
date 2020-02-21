import * as React from "react";
import * as ReactDOM from "react-dom";

type Props = {
  children: any;
  top?: string;
  bottom?: string;
  right?: string;
  left?: string;
  height?: string;
  width?: string;
};

export const fixedContentRef = React.createRef<HTMLDivElement>();

export const FixedContent = (props: Props) => {
  const { top, left, bottom, right, children, height, width } = props;
  const domNode = fixedContentRef.current;

  React.useEffect(() => {
    if (!fixedContentRef.current) {
      return;
    }

    if (top !== undefined) {
      fixedContentRef.current.style.top = top;
    }

    if (bottom !== undefined) {
      fixedContentRef.current.style.bottom = bottom;
    }

    if (left !== undefined) {
      fixedContentRef.current.style.left = left;
    }

    if (right !== undefined) {
      fixedContentRef.current.style.right = right;
    }

    if (height !== undefined) {
      fixedContentRef.current.style.height = height;
    }

    if (width !== undefined) {
      fixedContentRef.current.style.width = width;
    }
  }, [top, left, bottom, right, height, width]);

  if (domNode === null) {
    return null;
  }

  return ReactDOM.createPortal(children, domNode);
};
