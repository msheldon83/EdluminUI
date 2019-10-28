import * as React from "react";
import { makeStyles, Tabs, Tab, Paper } from "@material-ui/core";

type Props = {
  steps: Array<Step>;
  isWizard?: boolean;
};
export type Step = {
  stepNumber: number;
  name: string;
  content: (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => JSX.Element;
};

export const TabbedHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const [currentStepNumber, setStep] = React.useState(
    props.steps[0].stepNumber
  );
  const handleStepChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    if (props.isWizard && newValue > currentStepNumber) {
      return;
    }

    setStep(newValue);
  };

  const currentStep = props.steps.find(s => s.stepNumber === currentStepNumber);

  return (
    <>
      <Paper square className={classes.tabs}>
        <Tabs
          value={currentStepNumber}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleStepChange}
        >
          {props.steps.map((s, i) => (
            <Tab key={i} label={`${s.stepNumber + 1}. ${s.name}`} />
          ))}
        </Tabs>
      </Paper>
      {currentStep && currentStep.content(setStep)}
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
