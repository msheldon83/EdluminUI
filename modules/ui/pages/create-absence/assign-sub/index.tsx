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

const getScheduleLettersArray = () => {
  return new Array(26).fill(1).map((_, i) => String.fromCharCode(65 + i));
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
  const vacancyDetailsRef = React.useRef<HTMLInputElement>(null);

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
    if (props.vacancyId) {
      return null;
    }

    const vacanciesInput = props.vacancies.map(v => {
      return {
        positionId: v.positionId,
        needsReplacement: true,
        details: v.details!.map(d => {
          return {
            date: d?.startTimeLocal,
            startTime:
              d && d.startTimeLocal
                ? secondsSinceMidnight(
                    parseTimeFromString(format(d.startTimeLocal, "h:mm a"))
                  )
                : 0,
            endTime:
              d && d.endTimeLocal
                ? secondsSinceMidnight(
                    parseTimeFromString(format(d.endTimeLocal, "h:mm a"))
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

  const getDateRangeDisplayText = (startDate: Date, endDate: Date) => {
    let displayText = null;
    if (startDate.getMonth() === endDate.getMonth()) {
      displayText = `${format(startDate, "MMMM d")}-${format(
        endDate,
        "d, yyyy"
      )}`;
    } else if (startDate.getFullYear() !== endDate.getFullYear()) {
      displayText = `${format(startDate, "MMMM d, yyyy")} - ${format(
        endDate,
        "MMMM d, yyyy"
      )}`;
    } else {
      displayText = `${format(startDate, "MMMM d")} - ${format(
        endDate,
        "MMMM d, yyyy"
      )}`;
    }
    return displayText;
  };

  const renderVacancyDetails = () => {
    const sortedVacancies = props.vacancies
      .slice()
      .sort((a, b) => a.startTimeLocal - b.startTimeLocal);
    const firstVacancy = sortedVacancies[0];
    const lastVacancy = sortedVacancies[sortedVacancies.length - 1];
    const totalVacancyDays = sortedVacancies.reduce((total, v) => {
      return v.numDays ? total + v.numDays : total;
    }, 0);

    // Build the Vacancy Details header text
    const dayLengthDisplayText =
      totalVacancyDays > 1
        ? `${totalVacancyDays} days`
        : `${totalVacancyDays} day`;
    let headerText = getDateRangeDisplayText(
      firstVacancy.startTimeLocal,
      lastVacancy.endTimeLocal
    );
    headerText = props.positionName
      ? `${headerText} (${dayLengthDisplayText}) - ${props.positionName}`
      : `${headerText} (${dayLengthDisplayText})`;

    const scheduleLetters = getScheduleLettersArray();
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
          <Grid container spacing={2} ref={vacancyDetailsRef}>
            <Grid item xs={12}>
              <Typography variant="h5">{headerText}</Typography>
            </Grid>
            {sortedVacancies.map((v, detailsIndex) => {
              return (
                <Grid
                  key={detailsIndex}
                  item
                  container
                  xs={12}
                  alignItems="center"
                >
                  <Grid item xs={2}>
                    <Typography variant="h6">
                      {getDateRangeDisplayText(
                        v.startTimeLocal,
                        v.endTimeLocal
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={10} className={classes.scheduleText}>
                    {`${t("Schedule")} ${scheduleLetters[detailsIndex]}`}
                  </Grid>
                  {v.details &&
                    v.details.map((b, blocksIndex) => {
                      return (
                        <Fragment key={blocksIndex}>
                          <Grid
                            item
                            xs={2}
                            className={classes.vacancyBlockItem}
                          >
                            {`${format(b!.startTimeLocal, "h:mm a")} - ${format(
                              b!.endTimeLocal,
                              "h:mm a"
                            )}`}
                          </Grid>
                          <Grid
                            item
                            xs={10}
                            className={classes.vacancyBlockItem}
                          >
                            {b!.location ? b!.location.name : b!.locationId}
                          </Grid>
                        </Fragment>
                      );
                    })}
                </Grid>
              );
            })}
          </Grid>
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
  vacancyBlockItem: {
    marginTop: theme.spacing(0.5),
  },
  viewAllDetails: {
    cursor: "pointer",
    marginTop: theme.spacing(),
  },
  scheduleText: {
    color: "#9E9E9E",
  },
  filters: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
}));
