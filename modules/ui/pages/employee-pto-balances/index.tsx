import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { useTranslation } from "react-i18next";
import { useGetEmployee } from "reference-data/employee";
import { RemainingBalances } from "./components/remaining-balances";

type Props = {};

export const EmployeePtoBalances: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const employee = useGetEmployee();

  return (
    <>
      <RemainingBalances
        employeeId={employee?.id}
        title={t("Remaining balances")}
        showEdit={false}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({}));
