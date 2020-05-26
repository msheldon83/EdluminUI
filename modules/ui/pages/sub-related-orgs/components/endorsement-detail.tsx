import * as React from "react";
import clsx from "clsx";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles } from "@material-ui/core";
import { DateInput } from "ui/components/form/date-input";

type Props = {
  onRemoveEndorsement: () => void;
  setFieldValue: Function;
  submitForm: () => Promise<any>;
  name: string;
  expirationDate: Date;
  endorsementIndex: number;
  orgRelationshipIndex: number;
};

export const EndorsementDetail: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    onRemoveEndorsement,
    expirationDate,
    endorsementIndex,
    orgRelationshipIndex,
    setFieldValue,
    submitForm,
    name,
  } = props;

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
          <div className={classes.paddingLeft}> {name}</div>
        </Grid>
        <Grid item xs={5} className={classes.displayInline}>
          <DateInput
            value={expirationDate ?? ""}
            placeholder={t("expires")}
            onChange={async (date: any) => {
              const newDate = date === "" ? undefined : date;

              setFieldValue(
                `orgUserRelationships[${orgRelationshipIndex}].attributes[${endorsementIndex}].expirationDate`,
                newDate
              );

              //Allow User to remove an Expiration Date.
              if (newDate === undefined) await submitForm();
            }}
            onValidDate={async date => {
              setFieldValue(
                `orgUserRelationships[${orgRelationshipIndex}].attributes[${endorsementIndex}].expirationDate`,
                date
              );
              await submitForm();
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
            onClick={() => onRemoveEndorsement()}
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
  paddingLeft: {
    paddingLeft: theme.spacing(2),
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
