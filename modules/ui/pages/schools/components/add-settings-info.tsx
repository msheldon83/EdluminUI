import {
  Checkbox,
  FormControlLabel,
  FormHelperText,
  makeStyles,
  Radio,
  RadioGroup,
  Typography,
} from "@material-ui/core";
import { Formik } from "formik";
import { useQueryBundle } from "graphql/hooks";
import {
  Contract,
  NeedsReplacement,
  AbsenceReasonTrackingTypeId,
} from "graphql/server-types.gen"; // Not sure which I will need yet
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { OptionTypeBase } from "react-select/src/types";
import { DurationInput } from "ui/components/form/duration-input";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as yup from "yup";
import { ActionButtons } from "../../../components/action-buttons";
import { useMemo } from "react";

type Props = {
  orgId: string;
  location: {
    name: string;
  };
  submitText: string;
  onSubmit: (forPermanentPositions: boolean) => Promise<unknown>;
  onCancel: () => void;
};

export const AddSettingsInfo: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  return (
    <ActionButtons
      submit={{ text: props.submitText, execute: submitForm }}
      cancel={{ text: t("Cancel"), execute: props.onCancel }}
    />
  );
};

const useStyles = makeStyles(theme => ({
  useForEmployeesSubItems: {
    marginLeft: theme.spacing(4),
  },
  needSubLabel: {
    marginTop: theme.spacing(2),
  },
  mobileSectionSpacing: {
    marginTop: theme.spacing(2),
  },
  formHelperText: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  normalSectionSpacing: {
    marginTop: theme.spacing(6),
  },
  contractSection: {
    maxWidth: "500px",
    "& p": {
      marginLeft: 0,
    },
  },
  minAbsenceSection: {
    maxWidth: "500px",
    "& p": {
      marginLeft: 0,
    },
  },
  minAbsenceDurationLabel: {
    marginTop: theme.spacing(2),
  },
  checkboxError: {
    color: theme.palette.error.main,
  },
  appliesToError: {
    marginTop: theme.spacing(2),
    fontSize: theme.typography.pxToRem(14),
  },
  payTypeSection: {
    maxWidth: "500px",
    "& p": {
      marginLeft: 0,
    },
  },
}));
