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
    goToNextStep: Function
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

  useEffect(() => {
    setStep(initialStepNumber ?? steps[0].stepNumber);
  }, [initialStepNumber, steps]);

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
    borderRadius: theme.typography.pxToRem(5),
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
