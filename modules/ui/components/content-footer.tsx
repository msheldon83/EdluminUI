import * as React from "react";
import * as ReactDOM from "react-dom";

type Props = {
  children: any;
  height?: string;
};

export const contentFooterRef = React.createRef<HTMLDivElement>();

export const ContentFooter = (props: Props) => {
  const { children, height } = props;
  const domNode = contentFooterRef.current;

  React.useEffect(() => {
    if (!contentFooterRef.current) {
      return;
    }

    if (height !== undefined) {
      contentFooterRef.current.style.height = height;
    }
  }, [height]);

  if (domNode === null) {
    return null;
  }

  return ReactDOM.createPortal(children, domNode);
};
