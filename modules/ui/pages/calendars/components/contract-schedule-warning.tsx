import * as React from "react";
import { Section } from "ui/components/section";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

type Props = {
  showWarning: boolean;
  schoolYearName: string;
  schoolYearId: string;
  contracts: {
    id: string;
    name: string;
  }[];
};

export const ContractScheduleWarning: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  if (!props.showWarning) {
    return <></>;
  }

  return (
    <>
      <Section>
        <div>{`${t("These contracts do not have a start date for")} ${
          props.schoolYearName
        } ${t("school year")}`}</div>
        <div>
          {t(
            "Employees assigned to these contracts will not be able to create absences until this step is completed"
          )}
        </div>
        <div>
          {props.contracts.map((c, i) => {
            return <div key={i}>{c.name}</div>;
          })}
        </div>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  select: {
    display: "flex",
    flexDirection: "column",
    minWidth: theme.typography.pxToRem(250),
  },
  fromSelect: {
    marginLeft: theme.spacing(6),
  },
}));
