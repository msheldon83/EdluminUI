import React from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { makeStyles } from "@material-ui/core/styles";

type CrossFadeProps = {
  fadeKey: string;
  fadeMs?: number;
  children: React.ReactChildren;
  component?: any;
};

const ANIMATION_TIMEOUT = 500;

export const CrossFade = (props: CrossFadeProps) => {
  const {
    fadeKey,
    children,
    fadeMs = ANIMATION_TIMEOUT,
    component,
    ...restProps
  } = props;

  const animationClasses = useAnimationStyles(props);

  return (
    <TransitionGroup component={component}>
      <CSSTransition
        {...restProps}
        key={fadeKey}
        classNames={{
          enter: animationClasses.enter,
          enterActive: animationClasses.enterActive,
          exit: animationClasses.exit,
          exitActive: animationClasses.exitActive,
        }}
        timeout={fadeMs}
      >
        {children}
      </CSSTransition>
    </TransitionGroup>
  );
};

const useAnimationStyles = makeStyles(theme => ({
  enter: {
    opacity: 0,
  },
  enterActive: {
    opacity: 1,
    transition: `all ${ANIMATION_TIMEOUT}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  },
  exit: {
    opacity: 1,
    height: 0,
    overflow: "hidden",
  },
  exitActive: {
    opacity: 0,
    overflow: "hidden",
    transition: `all ${ANIMATION_TIMEOUT}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  },
}));
