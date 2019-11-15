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
import { PageTitle } from "ui/components/page-title";
import {
  Typography,
  Divider,
  Button,
  Tooltip,
  Grid,
  Collapse,
  Link,
} from "@material-ui/core";
import {
  AccountCircleOutlined,
  Star,
  StarBorder,
  Check,
  Cancel,
  Visibility,
  VisibilityOff,
  AccessTime,
} from "@material-ui/icons";
import { Column } from "material-table";
import {
  VacancyQualification,
  VacancyAvailability,
  AbsenceVacancyInput,
  Vacancy,
} from "graphql/server-types.gen";
import { TFunction } from "i18next";
import { AssignSubFilters as Filters } from "./filters";
import format from "date-fns/format";
import { PaginationControls } from "ui/components/pagination-controls";
import { secondsSinceMidnight, parseTimeFromString } from "helpers/time";
import { VacancyDetails } from "../vacancy-details";
import { convertStringToDate } from "helpers/date";

type Props = {
  orgId: string;
  vacancyId?: string | null | undefined;
  vacancies: Pick<
    Vacancy,
    "startTimeLocal" | "endTimeLocal" | "numDays" | "positionId" | "details"
  >[];
  userIsAdmin: boolean;
  employeeName: string;
  positionId?: number | null | undefined;
  positionName?: string | null | undefined;
};

const getQualifiedIcon = (qualified: VacancyQualification, t: TFunction) => {
  switch (qualified) {
    case VacancyQualification.Fully:
      return (
        <Tooltip title={t("Fully qualified")}>
          <Check />
        </Tooltip>
      );
    // TODO: This has to be distinguished from FULLY with a different icon
    case VacancyQualification.Minimally:
      return (
        <Tooltip title={t("Minimally qualified")}>
          <Check />
        </Tooltip>
      );
    case VacancyQualification.NotQualified:
      return <Cancel />;
  }
};

const getAvailableIcon = (available: VacancyAvailability, t: TFunction) => {
  switch (available) {
    case VacancyAvailability.Yes:
      return <Check />;
    // TODO: This has to be distinguished from YES with a different icon
    case VacancyAvailability.MinorConflict:
      return (
        <Tooltip title={t("Minor conflict")}>
          <Check />
        </Tooltip>
      );
    case VacancyAvailability.No:
      return <Cancel />;
  }
};

const getVisibleIcon = (
  visible: boolean,
  visibleOn?: Date | null | undefined,
  t: TFunction
) => {
  if (visible) {
    return <Visibility />;
  }

  if (!visibleOn) {
    return <VisibilityOff />;
  }

  // TODO: Add a tooltip to show when this will be visible to the Sub
  return (
    <Tooltip title={`${t("Visible on")} ${visibleOn}`}>
      <AccessTime />
    </Tooltip>
  );
};

const getFavoriteIcon = (
  isEmployeeFavorite: boolean,
  isLocationPositionTypeFavorite: boolean
) => {
  if (isEmployeeFavorite || isLocationPositionTypeFavorite) {
    return <Star />;
  }

  return null;
};

export const AssignSub: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useScreenSize() === "mobile";
  const [vacancyDetailsExpanded, setVacancyDetailsExpanded] = React.useState(
    false
  );

  // Vacancy Details collapse configuration
  const collapsedVacancyDetailsHeight = 150;
  const [vacancyDetailsHeight, setVacancyDetailsHeight] = React.useState<
    number | null
  >(null);
  const vacancyDetailsRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      vacancyDetailsRef &&
      vacancyDetailsRef.current &&
      vacancyDetailsRef.current.clientHeight != vacancyDetailsHeight
    ) {
      setVacancyDetailsHeight(vacancyDetailsRef.current.clientHeight);
    }
  });

  const buildVacancyInput = (): AbsenceVacancyInput[] | null => {
    const vacanciesInput = props.vacancies.map(v => {
      return {
        positionId: v.positionId,
        needsReplacement: true,
        details: v.details!.map(d => {
          const startTimeLocal =
            d && d.startTimeLocal
              ? convertStringToDate(d.startTimeLocal)
              : null;
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
        vacancies: buildVacancyInput(),
      },
    }
  );

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
      primaryPhone: "123-134-3456",
      qualified: r.qualified,
      available: r.available,
      visible: r.visible,
      visibleOn: r.visibleAtLocal,
      isEmployeeFavorite: r.isEmployeeFavorite,
      isLocationPositionTypeFavorite: r.isLocationPositionTypeFavorite,
      // TODO: Figure out the logic for whether or not this Sub can be assigned
      selectable: true,
    }));
  }, [replacementEmployees]);

  if (
    getReplacementEmployeesForVacancyQuery.state === "LOADING" ||
    !getReplacementEmployeesForVacancyQuery.data.absence
      ?.replacementEmployeesForVacancy?.results
  ) {
    return <></>;
  }

  //TODO: Custom sort handling for Star column, Qualified, Available, Visible

  const columns: Column<typeof tableData[0]>[] = [
    {
      title: t("Favorite"),
      cellStyle: {
        width: isMobile
          ? theme.typography.pxToRem(40)
          : theme.typography.pxToRem(70),
        textAlign: "center",
      },
      headerStyle: {
        textAlign: "center",
      },
      render: (data: typeof tableData[0]) =>
        getFavoriteIcon(
          data.isEmployeeFavorite,
          data.isLocationPositionTypeFavorite
        ),
      sorting: false,
    },
    {
      cellStyle: {
        width: isMobile
          ? theme.typography.pxToRem(40)
          : theme.typography.pxToRem(70),
      },
      render: () => <AccountCircleOutlined />, // eslint-disable-line
      sorting: false,
    },
    {
      title: t("First name"),
      field: "firstName",
    },
    {
      title: t("Last name"),
      field: "lastName",
    },
    { title: t("Primary phone"), field: "primaryPhone" },
  ];

  // Only Admins see the Qualified and Available columns
  if (props.userIsAdmin) {
    columns.push({
      title: t("Qualified"),
      field: "qualified",
      render: (data: typeof tableData[0]) =>
        getQualifiedIcon(data.qualified, t),
      cellStyle: {
        textAlign: "center",
      },
      headerStyle: {
        textAlign: "center",
      },
      sorting: false,
    });
    columns.push({
      title: t("Available"),
      field: "available",
      render: (data: typeof tableData[0]) =>
        getAvailableIcon(data.available, t),
      cellStyle: {
        textAlign: "center",
      },
      headerStyle: {
        textAlign: "center",
      },
      sorting: false,
    });
  }

  columns.push({
    title: t("Visible"),
    field: "visible",
    render: (data: typeof tableData[0]) =>
      getVisibleIcon(data.visible, data.visibleOn, t),
    cellStyle: {
      textAlign: "center",
    },
    headerStyle: {
      textAlign: "center",
    },
    sorting: false,
  });
  columns.push({
    title: "",
    field: "actions",
    sorting: false,
    render: (data: typeof tableData[0]) => (
      <Button
        variant="outlined"
        disabled={!data.selectable}
        onClick={() => {
          console.log("Selecting Employee Id", data.employeeId);
        }}
      >
        {props.vacancyId ? t("Assign") : t("Select")}
      </Button>
    ),
  });

  const replacementEmployeeCount = pagination.totalCount;
  const pageHeader = props.vacancyId
    ? props.userIsAdmin
      ? t("Assigning substitute for")
      : t("Assigning substitute")
    : props.userIsAdmin
    ? t("Prearranging substitute for")
    : t("Prearranging substitute");

  //TODO: Support this
  const search = async (
    name: string,
    qualified: VacancyQualification[],
    available: VacancyAvailability[],
    favoritesOnly: boolean
  ) => {};

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
            search={search}
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
}));
