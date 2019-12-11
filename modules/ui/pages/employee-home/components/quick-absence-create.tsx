import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, Grid, Checkbox, Link } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";

type Props = {};

export const QuickAbsenceCreate: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Section>
      <SectionHeader title={t("Create absence")} />
    </Section>
  );
};

const useStyles = makeStyles(theme => ({}));
