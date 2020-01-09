import * as React from "react";
import { Button } from "@material-ui/core";
import { ButtonProps } from "@material-ui/core/Button";
import IconButton, { IconButtonProps } from "@material-ui/core/IconButton";

export const ButtonDisableOnClick = React.memo((props: ButtonProps) => {
  const [disabled, setDisabled] = React.useState(false);
  const { onClick } = props;
  const wrappedOnClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setDisabled(true);
      onClick && onClick(event);
    },
    [onClick]
  );

  return (
    <Button
      {...props}
      onClick={wrappedOnClick}
      disabled={props.disabled || disabled}
    />
  );
});

export const IconButtonDisableOnClick = React.memo((props: IconButtonProps) => {
  const [disabled, setDisabled] = React.useState(false);
  const { onClick } = props;
  const wrappedOnClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      setDisabled(true);
      onClick && onClick(event);
    },
    [onClick]
  );

  return <IconButton {...props} onClick={wrappedOnClick} disabled={disabled} />;
});
