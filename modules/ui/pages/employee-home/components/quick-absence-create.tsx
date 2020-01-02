import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, Grid, Checkbox, Link } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useIsAdmin } from "reference-data/is-admin";
import { useGetEmployee } from "reference-data/employee";
import { useQueryBundle } from "graphql/hooks";
import { FindEmployeeForCurrentUser } from "ui/pages/create-absence/graphql/find-employee-for-current-user.gen";
import { findEmployee } from "ui/components/absence/helpers";
import { NeedsReplacement } from "graphql/server-types.gen";

type Props = {};

export const QuickAbsenceCreate: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const userIsAdmin = useIsAdmin();
  const potentialEmployees = useQueryBundle(FindEmployeeForCurrentUser, {
    fetchPolicy: "cache-first",
  });
  if (
    (potentialEmployees.state !== "DONE" &&
      potentialEmployees.state !== "UPDATING") ||
    userIsAdmin === null
  ) {
    return <></>;
  }

  const employee = findEmployee(potentialEmployees.data);
  if (!employee) {
    throw new Error("The user is not an employee");
  }
  const needsReplacement =
    employee.primaryPosition?.needsReplacement ?? NeedsReplacement.No;

  return (
    <Section>
      <SectionHeader title={t("Create absence")} />
    </Section>
  );
};

const useStyles = makeStyles(theme => ({}));
