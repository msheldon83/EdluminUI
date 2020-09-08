import * as React from "react";
import { NeedsReplacement } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import {
  FormControlLabel,
  Checkbox,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { PermissionEnum } from "graphql/server-types.gen";
import { Can } from "ui/components/auth/can";

type Props = {
  actingAsEmployee: boolean;
  needsReplacement: NeedsReplacement;
  holdForManualFill?: boolean;
  permissions: PermissionEnum[];
  value: boolean;
  onChangeManualFill?: (checked: boolean) => void;
  onChangeRequiresSub: (checked: boolean) => void;
  disabled?: boolean;
};

export const NeedsReplacementCheckbox: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    actingAsEmployee,
    needsReplacement,
    value,
    onChangeRequiresSub,
    disabled,
    holdForManualFill,
    onChangeManualFill,
    permissions,
  } = props;

  const canDisplayHoldForManualFill =
    holdForManualFill !== undefined && Config.isDevFeatureOnly;

  return (
    <>
      {!actingAsEmployee || needsReplacement === NeedsReplacement.Sometimes ? (
        <>
          <FormControlLabel
            label={t("Requires a substitute")}
            className={classes.displayInline}
            control={
              <Checkbox
                checked={value}
                onChange={e => onChangeRequiresSub(e.target.checked)}
                color="primary"
                disabled={disabled}
              />
            }
          />
          {canDisplayHoldForManualFill && (
            <Can do={permissions}>
              <FormControlLabel
                label={t("Fill manually")}
                className={classes.displayInline}
                control={
                  <Checkbox
                    checked={holdForManualFill}
                    onChange={e => {
                      onChangeManualFill &&
                        onChangeManualFill(e.target.checked);
                    }}
                    color="primary"
                    disabled={disabled}
                  />
                }
              />
            </Can>
          )}
        </>
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
  displayInline: {
    display: "inline-block",
  },
}));
