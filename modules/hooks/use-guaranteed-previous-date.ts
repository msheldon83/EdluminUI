import * as React from "react";

export const useGuaranteedPreviousDate = (date: Date | string | undefined) => {
  const ref = React.useRef(new Date());

  // Store current value in ref
  React.useEffect(() => {
    //
    if (date instanceof Date) {
      ref.current = date;
    }
  }, [date]);

  // Return previous value (happens before update in useEffect above)
  return ref.current;
};
