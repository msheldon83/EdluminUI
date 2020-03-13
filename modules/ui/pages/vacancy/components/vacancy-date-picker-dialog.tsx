import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { TextButton } from "ui/components/text-button";
import { makeStyles } from "@material-ui/styles";
import { VacancyDateSelect } from "./vacancy-date-select";
import { startOfDay } from "date-fns";
import { isSameDay } from "date-fns/esm";
import { find } from "lodash-es";

type Props = {
  open: boolean;
  onClose: () => void;
  onSetDates: (d: Date[]) => void;
  contractId: string;
  vacancyDates: Date[];
  currentMonth: Date;
  onMonthChange: (d: Date) => void;
};

export const SelectVacancyDateDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selectedDates, setSelectedDates] = React.useState<Date[]>(
    props.vacancyDates
  );

  const toggleVacancyDates = (dates: Date[]) => {
    let dateSelection: Date[] = selectedDates.slice();
    dates.forEach(d => {
      const date = startOfDay(d);
      if (find(selectedDates, sd => isSameDay(sd, date))) {
        dateSelection = dateSelection.filter(s => !isSameDay(s, date));
      } else {
        dateSelection.push(d);
      }
    });
    setSelectedDates(dateSelection);
  };

  const handleSelectDates = () => {
    props.onSetDates(selectedDates);
  };

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle disableTypography>
        <Typography variant="h5">
          {t("Select dates for your vacancy")}
        </Typography>
      </DialogTitle>
      <DialogContent className={classes.dialog}>
        <VacancyDateSelect
          contractId={props.contractId}
          vacancySelectedDates={selectedDates}
          onSelectDates={toggleVacancyDates}
          month={props.currentMonth}
          onMonthChange={props.onMonthChange}
        />
      </DialogContent>

      <Divider className={classes.divider} />
      <DialogActions>
        <TextButton onClick={props.onClose} className={classes.buttonSpacing}>
          {t("Cancel")}
        </TextButton>
        <ButtonDisableOnClick
          variant="outlined"
          onClick={handleSelectDates}
          className={classes.delete}
        >
          {t("Select dates")}
        </ButtonDisableOnClick>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  buttonSpacing: {
    paddingRight: theme.spacing(2),
  },
  removeSub: {
    paddingTop: theme.spacing(2),
    fontWeight: theme.typography.fontWeightMedium,
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(2),
  },
  delete: { color: theme.customColors.darkRed },
  dialog: {
    width: "550px",
    height: "425px",
  },
}));
