import * as React from "react";
import * as ReactDOM from "react-dom";

type Props = {
  children: any;
};

export const contentFooterRef = React.createRef<HTMLDivElement>();

export const ContentFooter = (props: Props) => {
  const { children } = props;
  const domNode = contentFooterRef.current;

  if (domNode === null) {
    return null;
  }

  return ReactDOM.createPortal(children, domNode);
};
