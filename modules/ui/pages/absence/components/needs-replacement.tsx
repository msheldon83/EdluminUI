import * as React from "react";
import { NeedsReplacement } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import {
  FormControlLabel,
  Checkbox,
  makeStyles,
  Typography,
} from "@material-ui/core";

type Props = {
  actingAsEmployee: boolean;
  needsReplacement: NeedsReplacement;
  value: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export const NeedsReplacementCheckbox: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    actingAsEmployee,
    needsReplacement,
    value,
    onChange,
    disabled,
  } = props;

  return (
    <>
      {!actingAsEmployee || needsReplacement === NeedsReplacement.Sometimes ? (
        <FormControlLabel
          label={t("Requires a substitute")}
          control={
            <Checkbox
              checked={value}
              onChange={e => onChange(e.target.checked)}
              color="primary"
              disabled={disabled}
            />
          }
        />
      ) : (
        <Typography className={classes.substituteRequiredText}>
          {needsReplacement === NeedsReplacement.Yes
            ? t("Requires a substitute")
            : t("No substitute required")}
        </Typography>
      )}
    </>
  );
};

const useStyles = makeStyles(() => ({
  substituteRequiredText: {
    fontStyle: "italic",
  },
}));
