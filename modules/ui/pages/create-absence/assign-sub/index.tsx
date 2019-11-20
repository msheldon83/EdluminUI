import * as React from "react";
import { useEffect, useMemo, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { usePagedQueryBundle, useMutationBundle } from "graphql/hooks";
import { makeStyles, useTheme } from "@material-ui/styles";
import { useScreenSize } from "hooks";
import { GetReplacementEmployeesForVacancy } from "ui/pages/create-absence/graphql/get-replacement-employees.gen";
import { Section } from "ui/components/section";
import { compact } from "lodash-es";
import { Table } from "ui/components/table";
import { Typography, Divider, Collapse, Link } from "@material-ui/core";
import { AbsenceVacancyInput } from "graphql/server-types.gen";
import {
  AssignSubFilters as Filters,
  ReplacementEmployeeFilters,
} from "./filters";
import format from "date-fns/format";
import { PaginationControls } from "ui/components/pagination-controls";
import { secondsSinceMidnight, parseTimeFromString } from "helpers/time";
import { VacancyDetails } from "../vacancy-details";
import { convertStringToDate } from "helpers/date";
import { getAssignSubColumns } from "./columns";
import { VacancyData } from "../ui";

type Props = {
  orgId: string;
  vacancyId?: string | null | undefined;
  vacancies: VacancyData[];
  userIsAdmin: boolean;
  employeeName: string;
  positionId?: string;
  positionName?: string;
  selectReplacementEmployee: (
    replacementEmployeeId: number,
    name: string
  ) => Promise<void>;
};

const buildVacancyInput = (
  vacancies: VacancyData[]
): AbsenceVacancyInput[] | null => {
  const vacanciesInput = vacancies.map(v => {
    return {
      positionId: v.positionId,
      needsReplacement: true,
      details: v.details!.map(d => {
        const startTimeLocal =
          d && d.startTimeLocal ? convertStringToDate(d.startTimeLocal) : null;
        const endTimeLocal =
          d && d.endTimeLocal ? convertStringToDate(d.endTimeLocal) : null;

        return {
          date: d?.startTimeLocal,
          startTime: startTimeLocal
            ? secondsSinceMidnight(
                parseTimeFromString(format(startTimeLocal, "h:mm a"))
              )
            : 0,
          endTime: endTimeLocal
            ? secondsSinceMidnight(
                parseTimeFromString(format(endTimeLocal, "h:mm a"))
              )
            : 0,
          locationId: d?.locationId ?? 0,
        };
      }),
    };
  });

  return vacanciesInput;
};

export const AssignSub: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useScreenSize() === "mobile";
  const [vacancyDetailsExpanded, setVacancyDetailsExpanded] = React.useState(
    false
  );
  const [searchFilter, updateSearch] = React.useState<
    ReplacementEmployeeFilters
  >();

  // Vacancy Details collapse configuration
  const collapsedVacancyDetailsHeight = 150;
  const [vacancyDetailsHeight, setVacancyDetailsHeight] = React.useState<
    number | null
  >(null);
  const vacancyDetailsRef = React.useRef<HTMLDivElement>(null);
  const currentClientHeight = vacancyDetailsRef?.current?.clientHeight;
  useEffect(() => {
    if (currentClientHeight && currentClientHeight != vacancyDetailsHeight) {
      setVacancyDetailsHeight(currentClientHeight);
    }
  }, [currentClientHeight, vacancyDetailsHeight]);

  const [
    getReplacementEmployeesForVacancyQuery,
    pagination,
  ] = usePagedQueryBundle(
    GetReplacementEmployeesForVacancy,
    r => r.absence?.replacementEmployeesForVacancy?.totalCount,
    {
      variables: {
        orgId: props.orgId,
        vacancyId: props.vacancyId,
        vacancies: buildVacancyInput(props.vacancies),
        name: searchFilter?.name,
        qualified: searchFilter?.name ? undefined : searchFilter?.qualified,
        available: searchFilter?.name ? undefined : searchFilter?.available,
        favoritesOnly: searchFilter?.name
          ? undefined
          : searchFilter?.favoritesOnly,
      },
      skip: searchFilter === undefined,
    }
  );

  useEffect(() => {
    if (searchFilter) {
      getReplacementEmployeesForVacancyQuery.refetch();
    }
  }, [searchFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  let replacementEmployees: GetReplacementEmployeesForVacancy.Results[] = [];
  if (
    getReplacementEmployeesForVacancyQuery.state === "DONE" ||
    getReplacementEmployeesForVacancyQuery.state === "UPDATING"
  ) {
    const qResults: GetReplacementEmployeesForVacancy.Results[] = compact(
      getReplacementEmployeesForVacancyQuery.data?.absence
        ?.replacementEmployeesForVacancy?.results
    );
    if (qResults) replacementEmployees = qResults;
  }
  const tableData = useMemo(() => {
    return replacementEmployees.map(r => ({
      employeeId: r.employee.id,
      firstName: r.employee.firstName,
      lastName: r.employee.lastName,
      primaryPhone: r.employee.phoneNumber,
      qualified: r.qualified,
      available: r.available,
      visible: r.visible,
      visibleOn: r.visibleAtLocal,
      isEmployeeFavorite: r.isEmployeeFavorite,
      isLocationPositionTypeFavorite: r.isLocationPositionTypeFavorite,
      selectable: r.isSelectable,
    }));
  }, [replacementEmployees]);

  const setSearch = (filters: ReplacementEmployeeFilters) => {
    updateSearch(filters);
  };

  const renderVacancyDetails = () => {
    const showViewAllDetails =
      vacancyDetailsHeight &&
      vacancyDetailsHeight > collapsedVacancyDetailsHeight;

    return (
      <div>
        <Collapse
          in={vacancyDetailsExpanded}
          collapsedHeight={theme.typography.pxToRem(
            vacancyDetailsHeight
              ? Math.min(vacancyDetailsHeight, collapsedVacancyDetailsHeight)
              : collapsedVacancyDetailsHeight
          )}
        >
          <VacancyDetails
            vacancies={props.vacancies}
            positionName={props.positionName}
            gridRef={vacancyDetailsRef}
            showHeader
          />
        </Collapse>
        {showViewAllDetails && (
          <div className={classes.viewAllDetails}>
            <Link
              onClick={() => setVacancyDetailsExpanded(!vacancyDetailsExpanded)}
            >
              {vacancyDetailsExpanded
                ? t("Hide details")
                : t("View all details")}
            </Link>
          </div>
        )}
      </div>
    );
  };

  const replacementEmployeeCount = pagination.totalCount;
  const pageHeader = props.vacancyId
    ? t("Assign Substitute")
    : `${t("Create Absence")}: ${t("Prearranging Substitute")}`;

  const columns = useMemo(
    () =>
      getAssignSubColumns(
        tableData,
        props.userIsAdmin,
        props.selectReplacementEmployee,
        isMobile,
        theme,
        classes,
        t
      ),
    []
  );

  return (
    <>
      <div className={classes.header}>
        <Typography variant="h5">{pageHeader}</Typography>
        {props.userIsAdmin && (
          <Typography variant="h1">{props.employeeName}</Typography>
        )}
      </div>
      <Section>
        <div className={classes.vacancyDetails}>{renderVacancyDetails()}</div>
        <Divider />

        <div className={classes.filters}>
          <Filters
            showQualifiedAndAvailable={props.userIsAdmin}
            setSearch={setSearch}
          />
        </div>
        <Divider />

        <Table
          title={`${replacementEmployeeCount} ${
            replacementEmployeeCount === 1 ? t("substitute") : t("substitutes")
          }`}
          columns={columns}
          data={tableData}
          selection={false}
          style={{
            boxShadow: "initial",
          }}
          backgroundFillForAlternatingRows={true}
        />
        <PaginationControls pagination={pagination} />
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  vacancyDetails: {
    marginBottom: theme.spacing(3),
  },
  viewAllDetails: {
    cursor: "pointer",
    marginTop: theme.spacing(),
  },
  filters: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  selectButton: {
    color: theme.customColors.blue,
  },
}));
