import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { getDateRangeDisplay } from "ui/components/employee/helpers";
import { parseISO } from "date-fns";
import { flatMap, uniq } from "lodash-es";
import { Maybe } from "graphql/server-types.gen";

type Props = {
  isSelected: boolean;
  setSelected: React.Dispatch<
    React.SetStateAction<{
      id: string;
      isNormalVacancy: boolean;
    } | null>
  >;
  isPrevious?: boolean;
  vacancy: {
    id: string;
    isNormalVacancy: boolean;
    absenceId?: string | null;
    startDate?: string | null;
    endDate: string;
    createdLocal?: string | null;
    position?: {
      title: string;
    } | null;
    details: {
      vacancyReason?: {
        name: string;
      } | null;
    }[];
    absence?: {
      employee?: {
        firstName: string;
        lastName: string;
      } | null;
      details?:
        | Maybe<{
            reasonUsages?:
              | Maybe<{
                  absenceReason?: {
                    name: string;
                  } | null;
                }>[]
              | null;
          }>[]
        | null;
    } | null;
  };
};

export const InboxItem: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const vacancy = props.vacancy;

  const reasons = vacancy.isNormalVacancy
    ? vacancy.details.map(d => d?.vacancyReason?.name).join(", ")
    : uniq(
        flatMap(
          vacancy.absence?.details?.map(d =>
            d?.reasonUsages?.map(u => u?.absenceReason?.name)
          )
        )
      ).join(", ");

  const handleClick = () => {
    props.setSelected({
      id: vacancy.isNormalVacancy ? vacancy.id : vacancy.absenceId ?? "",
      isNormalVacancy: vacancy.isNormalVacancy,
    });
  };

  return (
    <div
      className={clsx({
        [classes.container]: true,
        [classes.selectedBorder]: props.isSelected,
        [classes.notSelectedBorder]: !props.isSelected,
      })}
      onClick={handleClick}
    >
      <div className={classes.typeText}>
        {vacancy.isNormalVacancy ? t("Vacancy") : t("Absence")}
      </div>
      <div className={classes.nameText}>
        {vacancy.isNormalVacancy
          ? vacancy.position?.title
          : `${vacancy.absence?.employee?.firstName} ${vacancy.absence?.employee?.lastName}`}
      </div>
      <div className={classes.dateReasonContainer}>
        <div>
          {getDateRangeDisplay(
            parseISO(vacancy.startDate!),
            parseISO(vacancy.endDate)
          )}
        </div>
        <div>{reasons}</div>
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    width: "100%",
    padding: theme.spacing(2),
    cursor: "pointer",
  },
  selectedBorder: {
    border: "1px solid #050039",
  },
  notSelectedBorder: {
    border: "1px solid #E1E1E1",
  },
  typeText: {
    fontSize: theme.typography.pxToRem(12),
    color: "#696688",
  },
  nameText: {
    fontSize: theme.typography.pxToRem(14),
    fontWeight: "bold",
    color: "#050039",
  },
  dateReasonContainer: {
    display: "flex",
  },
}));
