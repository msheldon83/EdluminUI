import * as React from "react";
import clsx from "clsx";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import { Divider, Grid, makeStyles, Typography } from "@material-ui/core";
import { DateInput } from "ui/components/form/date-input";

type Props = {
  onRemoveEndorsement: (endorsementId: string) => Promise<unknown>;
  onChangeEndorsement: (
    endorsementId: string,
    expirationDate: Date
  ) => Promise<unknown>;
  endorsement:
    | { name: string; validUntil?: Date | null; id: string }
    | undefined
    | null;
};

export const DistrictDetail: React.FC<Props> = props => {
  const classes = useStyles();
  const { onRemoveEndorsement, onChangeEndorsement, endorsement } = props;
  const e = endorsement;

  console.log(e?.validUntil);

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
            value={e?.validUntil ?? ""}
            placeholder="Expires"
            onChange={(date: string) =>
              //setFieldValue("dateOfBirth", date)

              console.log(date)
            }
            onValidDate={date =>
              //setFieldValue("dateOfBirth", date)
              console.log(date)
            }
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
            onClick={() => onRemoveEndorsement(e?.id ?? "")}
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
