import * as React from "react";
import clsx from "clsx";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import { Grid, makeStyles } from "@material-ui/core";
import { CustomEndorsement } from "../helpers";
import { DateInput } from "ui/components/form/date-input";

type Props = {
  onRemoveEndorsement: (arg0: CustomEndorsement) => Promise<void>;
  onChangeEndorsement: (arg0: CustomEndorsement) => Promise<void>;
  endorsement:
    | { name: string; validUntil?: Date; id: string }
    | undefined
    | null;
  orgId: string;
  expirationDate: Date;
  index: number;
};

export const DistrictDetail: React.FC<Props> = props => {
  const classes = useStyles();
  const {
    onRemoveEndorsement,
    onChangeEndorsement,
    endorsement,
    expirationDate,
    index,
    orgId,
  } = props;
  const e = endorsement;

  const [dateValue, setDateValue] = React.useState<Date>(expirationDate);

  const customEndorsement: CustomEndorsement = {
    id: e?.id ?? "",
    orgId: orgId,
    expirationDate: expirationDate,
    index: index,
  };

  return (
    <>
      <Grid item xs={12} container className={classes.container}>
        <Grid
          item
          xs={6}
          className={clsx({
            [classes.displayInline]: true,
            [classes.spacing]: true,
          })}
        >
          {e?.name}
        </Grid>
        <Grid item xs={5} className={classes.displayInline}>
          <DateInput
            className={classes.displayInline}
            value={dateValue}
            placeholder="Expires"
            onChange={(date: string) => {
              const dateConversion = new Date(date);
              setDateValue(dateConversion);

              console.log(dateValue);
              //onChangeEndorsement(customEndorsement);
            }}
            onValidDate={date => {
              setDateValue(date);
            }}
          />
        </Grid>
        <Grid
          item
          xs={1}
          className={clsx({
            [classes.displayInline]: true,
            [classes.spacing]: true,
          })}
        >
          <div
            onClick={() => onRemoveEndorsement(customEndorsement)}
            className={classes.hyperlink}
          >
            <DeleteForeverIcon />
          </div>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  displayInline: {
    display: "inline-block",
  },
  container: {
    paddingTop: theme.spacing(1),
  },
  spacing: {
    paddingTop: "10px",
  },
  hyperlink: {
    float: "right",
    textDecoration: "none",
    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
    },
    "&:link": {
      color: theme.customColors.black,
    },
    "&:visited": {
      color: theme.customColors.black,
    },
  },
}));
