import * as React from "react";
import { useEffect } from "react";
import { makeStyles, Tabs, Tab, Paper } from "@material-ui/core";

type Props = {
  steps: Array<Step>;
  isWizard?: boolean;
  showStepNumber?: boolean;
  initialStepNumber?: number;
};
export type Step = {
  stepNumber: number;
  name: string;
  content: (
    setStep: React.Dispatch<React.SetStateAction<number>>,
    goToNextStep: () => void
  ) => JSX.Element;
};

export const TabbedHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const initialStepNumber = props.initialStepNumber;
  const steps = props.steps;
  const [currentStepNumber, setStep] = React.useState(
    initialStepNumber ?? steps[0].stepNumber
  );
  const handleStepChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    if (props.isWizard && newValue > currentStepNumber) {
      return;
    }

    setStep(newValue);
  };

  // Don't add a dependency for "steps" here, because if the consumer doesn't
  // memoize the "steps" they are providing and something out there causes a rerender
  // the steps being passed into here will be reinstantiated and this will fire
  // which means you won't be able to change steps
  useEffect(() => {
    setStep(initialStepNumber ?? steps[0].stepNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStepNumber]);

  const currentStep = steps.find(s => s.stepNumber === currentStepNumber);

  const goToNextStep = () => {
    if (!currentStep) {
      return;
    }

    const currentStepIndex = steps.indexOf(currentStep);
    if (currentStepIndex + 1 >= steps.length) {
      // This is the last step
      return;
    }

    setStep(steps[currentStepIndex + 1].stepNumber);
  };

  return (
    <>
      <Paper square className={classes.tabs}>
        <Tabs
          value={currentStepNumber}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleStepChange}
        >
          {steps.map((s, i) => {
            return props.showStepNumber ? (
              <Tab key={i} label={`${s.stepNumber + 1}. ${s.name}`} />
            ) : (
              <Tab key={i} label={`${s.name}`} />
            );
          })}
        </Tabs>
      </Paper>
      {currentStep && currentStep.content(setStep, goToNextStep)}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  tabs: {
    borderTopLeftRadius: theme.typography.pxToRem(5),
    borderTopRightRadius: theme.typography.pxToRem(5),
    borderWidth: theme.typography.pxToRem(1),
    borderColor: theme.customColors.sectionBorder,
    borderStyle: "solid",
    borderBottom: "0",
    boxShadow: "initial",
    "& button": {
      textTransform: "uppercase",
    },
  },
}));
