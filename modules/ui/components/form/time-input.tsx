import * as React from "react";
import {
  isIso,
  humanizeTimeStamp,
  parseTimeFromString,
  timeStampToIso,
  isoToTimestamp,
} from "../../../helpers/time";
import { Input } from "./input";
import { InputBaseComponentProps } from "@material-ui/core";

export type TimeInputProps = {
  label: string;
  value?: string;
  name?: string;
  onChange: (value: string) => void;
  onValidTime: (value: string) => void;
  earliestTime?: string;
  ref?: React.Ref<any>;
  inputStatus?: "warning" | "error" | "success" | "default" | undefined | null;
  validationMessage?: string | undefined;
  disabled?: boolean;
  className?: string;
  placeHolder?: string;
  highlightOnFocus?: boolean;
  inputProps?: InputBaseComponentProps;
  onBlur?: (event: React.FocusEvent) => void;
};

export const TimeInput = React.forwardRef((props: TimeInputProps, ref) => {
  const {
    earliestTime,
    onValidTime,
    label,
    value = "",
    onChange,
    name,
    inputStatus = "default",
    validationMessage,
    disabled,
    className,
    placeHolder,
    highlightOnFocus = false,
    inputProps,
    onBlur,
  } = props;

  // Sometimes this ref is null if the parent doens't give a ref
  const inputRef = ref ?? React.useRef();
  const inputElement = (inputRef as React.RefObject<HTMLInputElement>).current;

  /*
  Using start to tracking a forced text selection to ensure that the selection sticks even if
  the props change from the parent. Sometimes the selection would get lost of there was data
  changing at the same time as the focus.
  */
  const [focusInitiated, setFocusInitiated] = React.useState(false);
  React.useEffect(() => {
    if (focusInitiated) {
      inputElement?.select();
      setFocusInitiated(false);
    }
  }, [inputElement, focusInitiated]);

  // Track if tab was used to initiate interaction with the input component
  const [tabKeyDown, setTabKeyDown] = React.useState(false);
  const handleWindowKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setTabKeyDown(true);
      }
    },
    [setTabKeyDown]
  );
  const handleWindowKeyUp = React.useCallback(() => setTabKeyDown(false), [
    setTabKeyDown,
  ]);
  React.useEffect(() => {
    /*
      These event are only necessary if the parent wants to make sure that the text
      gets highlighted on focus from a tab event. If not, there's no need to initiate them.
    */
    if (highlightOnFocus) {
      window.addEventListener("keydown", handleWindowKeyDown);
      window.addEventListener("keyup", handleWindowKeyUp);
    }

    // Remove event listeners
    return () => {
      if (highlightOnFocus) {
        window.removeEventListener("keydown", handleWindowKeyDown);
        window.removeEventListener("keyup", handleWindowKeyUp);
      }
    };
  }, [handleWindowKeyDown, handleWindowKeyUp, highlightOnFocus]);

  const parsedValue = isIso(value)
    ? humanizeTimeStamp(isoToTimestamp(value))
    : value;

  const attemptToParseValidTime = React.useCallback(
    event => {
      // It's not a valid time if there is no input
      if (!parsedValue) {
        return;
      }

      onValidTime(
        timeStampToIso(
          parseTimeFromString(event.target.value, earliestTime, earliestTime)
        )
      );
    },
    [earliestTime, onValidTime, parsedValue]
  );

  const handleFocus = React.useCallback(
    event => {
      /*
        Tracking the focus status to select the text on next render due to re-rendering
        and lifecycle of the component
      */
      setFocusInitiated(highlightOnFocus && tabKeyDown);

      attemptToParseValidTime(event);
    },
    [attemptToParseValidTime, highlightOnFocus, tabKeyDown]
  );

  return (
    <Input
      label={label}
      className={className}
      name={name}
      value={parsedValue}
      onChange={event => onChange(event.target.value)}
      onBlur={e => {
        attemptToParseValidTime(e);
        if (onBlur) onBlur(e);
      }}
      onFocus={handleFocus}
      inputRef={inputRef}
      inputStatus={inputStatus}
      disabled={disabled}
      validationMessage={validationMessage}
      placeholder={placeHolder}
      inputProps={inputProps}
    />
  );
});
