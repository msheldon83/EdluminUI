import * as React from "react";

export const usePreviousValue = <T>(value: T) => {
  const ref = React.useRef(value);

  // Store current value in ref
  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  // Return previous value (happens before update in useEffect above)
  return ref.current;
};
