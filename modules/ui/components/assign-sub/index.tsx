import { Button, Collapse, Divider, Link, Typography } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/styles";
import format from "date-fns/format";
import { useQueryBundle } from "graphql/hooks";
import {
  AbsenceVacancyInput as AbsenceVacancyInputType,
  Vacancy,
  VacancyCreateInput,
} from "graphql/server-types.gen";
import { convertStringToDate } from "helpers/date";
import { parseTimeFromString, secondsSinceMidnight } from "helpers/time";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useEffect, useMemo, useCallback } from "react";
import { useRouteParams } from "ui/routes/definition";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { AppChromeRoute } from "ui/routes/app-chrome";
import { Table } from "ui/components/table";
import { useRole } from "core/role-context";
import { AssignAbsenceDialog } from "ui/components/assign-absence-dialog";
import { GetReplacementEmployeesForVacancy } from "ui/pages/create-absence/graphql/get-replacement-employees.gen";
import { VacancyDetails } from "../absence/vacancy-details";
import { AssignSubColumn, getAssignSubColumns } from "./columns";
import { compact, uniq } from "lodash-es";
import {
  AssignSubFilters as Filters,
  ReplacementEmployeeFilters,
} from "./filters";
import { ReassignAbsenceDialog } from "ui/components/absence/reassign-dialog";
import { AssignmentOnDate } from "ui/components/absence/types";
import { AbsenceVacancyHeader } from "ui/components/absence-vacancy/header";
import { VacancySummaryHeader } from "../absence/vacancy-summary-header";
import { GetVacancyReplacementEmployees } from "./graphql/get-replacement-employees-for-vacancy.gen";
import { VacancySummary } from "../absence-vacancy/vacancy-summary";
import { VacancySummaryDetail } from "../absence-vacancy/vacancy-summary/types";
import { EmployeeLink } from "ui/components/links/people";
import { useAccountingCodes } from "reference-data/accounting-codes";
import { usePayCodes } from "reference-data/pay-codes";

type Props = {
  orgId: string;
  absenceId?: string;
  existingVacancy?: boolean;
  vacancies?: Vacancy[];
  vacancyDetailIdsToAssign?: string[];
  actingAsEmployee?: boolean;
  employeeName?: string;
  employeeId?: string;
  positionId?: string;
  positionName?: string;
  disabledDates?: Date[];
  selectButtonText?: string;
  onAssignReplacement: (
    replacementEmployeeId: string,
    replacementEmployeeFirstName: string,
    replacementEmployeeLastName: string,
    payCode: string | undefined,
    vacancyDetailIds?: string[],
    vacancyDetailDates?: Date[]
  ) => void;
  onCancel: () => void;
  employeeToReplace?: string;
  assignmentsByDate: AssignmentOnDate[];
  isForVacancy?: boolean;
  useVacancySummaryDetails?: boolean;
  vacancySummaryDetails?: VacancySummaryDetail[];
  vacancy?: VacancyCreateInput;
  vacancyId?: string;
  isEdit?: boolean;
};

export type ValidationChecks = {
  isQualified: boolean;
  isRejected: boolean;
  isMinorJobConflict: boolean;
  excludedSub: boolean;
  notIncluded: boolean;
  unavailableToWork: boolean;
};

type ReplacementEmployeeInfo = {
  id: string;
  firstName: string;
  lastName: string;
  payCode?: string;
};

export const AssignSub: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useIsMobile();
  const [vacancyDetailsExpanded, setVacancyDetailsExpanded] = React.useState(
    false
  );
  const [searchFilter, updateSearch] = React.useState<
    ReplacementEmployeeFilters
  >();
  const {
    onAssignReplacement,
    vacancyDetailIdsToAssign,
    employeeToReplace = "",
    vacancySummaryDetails,
    isForVacancy = false,
    useVacancySummaryDetails = false,
    vacancy = undefined,
    vacancyId = undefined,
  } = props;

  const [reassignDialogIsOpen, setReassignDialogIsOpen] = React.useState(false);
  const [warningDialogIsOpen, setWarningDialogIsOpen] = React.useState(false);
  const [replacementEmployeeInfo, setReplacementEmployeeInfo] = React.useState<
    ReplacementEmployeeInfo
  >({
    id: "",
    firstName: "",
    lastName: "",
  });

  const [validationChecks, setValidationChecks] = React.useState<
    ValidationChecks
  >();

  const [messages, setMessages] = React.useState<string[]>([]);

  // If we don't have any info, cancel the Assign Sub action
  if (
    (!useVacancySummaryDetails && !props.vacancies) ||
    props.vacancies?.length === 0 ||
    (useVacancySummaryDetails && !vacancySummaryDetails) ||
    vacancySummaryDetails?.length === 0
  ) {
    props.onCancel();
  }

  // Vacancy Details collapse configuration
  const collapsedVacancyDetailsHeight = 225;
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

  {
    /* As of 12/2/2019, we are not going to page this data.
  We will reintroduce pagining in the future. */
  }
  const getReplacementEmployeesForAbsenceVacancyQuery = useQueryBundle(
    GetReplacementEmployeesForVacancy,
    {
      variables: {
        orgId: props.orgId,
        vacancyId: props.vacancies
          ? props.vacancies[0]?.id ?? undefined
          : props.vacancyId
          ? props.vacancyId
          : undefined,
        vacancy:
          props.vacancies && !props.vacancies[0]?.id
            ? AbsenceVacancyInput(props.vacancies)
            : undefined,
        vacancyDetailIds: vacancyDetailIdsToAssign ?? undefined,
        absentEmployeeId: props.employeeId ?? undefined,
        name: searchFilter?.name,
        qualified: searchFilter?.name ? undefined : searchFilter?.qualified,
        available: searchFilter?.name ? undefined : searchFilter?.available,
        favoritesOnly: searchFilter?.name
          ? undefined
          : searchFilter?.favoritesOnly,
        limit: null,
        offset: null,
      },
      skip: searchFilter === undefined || isForVacancy,
    }
  );

  /** this query is used for vacancy subs */
  const getReplacementEmployeesForNormalVacancyQuery = useQueryBundle(
    GetVacancyReplacementEmployees,
    {
      variables: {
        orgId: props.orgId,
        vacancy: props.vacancy,
        vacancyId: props.vacancyId,
        vacancyDetailIds: props.vacancyId
          ? vacancyDetailIdsToAssign ?? undefined
          : undefined,
        name: searchFilter?.name,
        qualified: searchFilter?.name ? undefined : searchFilter?.qualified,
        available: searchFilter?.name ? undefined : searchFilter?.available,
        favoritesOnly: searchFilter?.name
          ? undefined
          : searchFilter?.favoritesOnly,
        limit: null,
        offset: null,
      },
      skip: searchFilter === undefined || !isForVacancy,
    }
  );

  useEffect(() => {
    if (searchFilter) {
      if (isForVacancy) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        getReplacementEmployeesForNormalVacancyQuery.refetch();
      } else {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        getReplacementEmployeesForAbsenceVacancyQuery.refetch();
      }
    }
  }, [searchFilter, isForVacancy]); // eslint-disable-line react-hooks/exhaustive-deps

  const replacementEmployees =
    (!isForVacancy &&
      getReplacementEmployeesForAbsenceVacancyQuery.state === "DONE") ||
    getReplacementEmployeesForAbsenceVacancyQuery.state === "UPDATING"
      ? compact(
          getReplacementEmployeesForAbsenceVacancyQuery.data?.absence
            ?.replacementEmployeesForVacancy?.results
        )
      : (isForVacancy &&
          getReplacementEmployeesForNormalVacancyQuery.state === "DONE") ||
        getReplacementEmployeesForNormalVacancyQuery.state === "UPDATING"
      ? compact(
          getReplacementEmployeesForNormalVacancyQuery.data?.vacancy
            ?.replacementEmployeesForVacancy?.results
        )
      : [];

  const tableData: AssignSubColumn[] = useMemo(() => {
    return replacementEmployees.map(r => ({
      employeeId: r.employeeId,
      firstName: r.firstName,
      lastName: r.lastName,
      primaryPhone: r.phoneNumber,
      qualified: r.levelQualified,
      available: r.levelAvailable,
      unavailableToWork: r.unavailableToWork,
      isAvailableToSubWhenSearching: r.isAvailableToSubWhenSearching,
      availableToSubWhenSearchingAtUtc: r.availableToSubWhenSearchingAtUtc,
      availableToSubWhenSearchingAtLocal: r.availableToSubWhenSearchingAtLocal,
      isEmployeeFavorite: r.isFavoriteEmployee,
      isLocationPositionTypeFavorite: r.isFavoritePositionType,
      selectable: r.isSelectable,
      payCodeId: r.payCodeId,
      isQualified: r.isQualified,
      isRejected: r.isRejected,
      isMinorJobConflict: r.isMinorJobConflict,
      excludedSub: r.excludedSub,
      notIncluded: r.notIncluded,
    }));
  }, [replacementEmployees]);

  //Get the role to determine whether or not the User will be alerted of minimally qualified subs.
  const contextRole = useRole();
  const isEmployee = props.actingAsEmployee || contextRole === "employee"; 

  const assignReplacementEmployee = useCallback(
    async (
      replacementEmployeeId: string,
      replacementEmployeeFirstName: string,
      replacementEmployeeLastName: string,
      payCodeId: string | undefined,
      validationChecks: ValidationChecks,
      ignoreAndContinue?: boolean
    ) => {
      if (
        !validator(validationChecks, setMessages, t) &&
        !ignoreAndContinue &&
        !isEmployee
      ) {
        setReplacementEmployeeInfo({
          id: replacementEmployeeId,
          firstName: replacementEmployeeFirstName,
          lastName: replacementEmployeeLastName,
          payCode: payCodeId,
        });
        setValidationChecks(validationChecks);
        setWarningDialogIsOpen(true);
      } else {
        onAssignReplacement(
          replacementEmployeeId,
          replacementEmployeeFirstName,
          replacementEmployeeLastName,
          payCodeId,
          vacancyDetailIdsToAssign,
          !vacancyDetailIdsToAssign && vacancySummaryDetails
            ? uniq(vacancySummaryDetails.map(vsd => vsd.date))
            : undefined
        );
      }
    },
    [onAssignReplacement, vacancyDetailIdsToAssign, vacancySummaryDetails, t]
  );

  const confirmReassign = useCallback(
    async (
      replacementEmployeeId: string,
      replacementEmployeeFirstName: string,
      replacementEmployeeLastName: string,
      payCodeId: string | undefined,
      validationChecks: ValidationChecks
    ) => {
      if (employeeToReplace) {
        setReplacementEmployeeInfo({
          id: replacementEmployeeId,
          firstName: replacementEmployeeFirstName,
          lastName: replacementEmployeeLastName,
          payCode: payCodeId,
        });
        setValidationChecks(validationChecks);
        setReassignDialogIsOpen(true);
      } else {
        await assignReplacementEmployee(
          replacementEmployeeId,
          replacementEmployeeFirstName,
          replacementEmployeeLastName,
          payCodeId,
          validationChecks
        );
      }
    },
    [assignReplacementEmployee, employeeToReplace]
  );

  const setSearch = (filters: ReplacementEmployeeFilters) => {
    updateSearch(filters);
  };

  const accountingCodes = useAccountingCodes(props.orgId);
  const payCodes = usePayCodes(props.orgId);

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
              ? Math.min(
                  vacancyDetailsHeight + (useVacancySummaryDetails ? 75 : 0),
                  collapsedVacancyDetailsHeight
                )
              : collapsedVacancyDetailsHeight
          )}
        >
          {props.vacancies && !useVacancySummaryDetails && (
            <VacancyDetails
              vacancies={props.vacancies}
              vacancyDetailIds={vacancyDetailIdsToAssign}
              positionName={props.positionName}
              gridRef={vacancyDetailsRef}
              showHeader
              disabledDates={props.disabledDates}
              detailsClassName={classes.vacancyDetailsTable}
              assignmentsByDate={props.assignmentsByDate}
              isForVacancy={isForVacancy}
            />
          )}
          {vacancySummaryDetails && useVacancySummaryDetails && (
            <>
              <VacancySummaryHeader
                positionName={props.positionName}
                vacancyDates={vacancySummaryDetails?.map((vsd: any) => {
                  return vsd.date;
                })}
              />
              <div className={classes.vacSubDetailContainer}>
                <VacancySummary
                  vacancySummaryDetails={vacancySummaryDetails}
                  onAssignClick={async () => {}}
                  onCancelAssignment={async () => true}
                  detailsOnly={true}
                  divRef={vacancyDetailsRef}
                  showAccountingCodes={
                    accountingCodes.length > 0 && (props.isForVacancy ?? false)
                  }
                  showPayCodes={
                    payCodes.length > 0 && (props.isForVacancy ?? false)
                  }
                />
              </div>
            </>
          )}
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

  const replacementEmployeeCount = replacementEmployees.length;
  const pageHeader = props.existingVacancy
    ? t("Assign Substitute")
    : isForVacancy
    ? t("Prearranging Substitute")
    : `${t("Create Absence")}: ${t("Prearranging Substitute")}`;

  const selectTitle = props.selectButtonText || t("Select")!;
  const columns = useMemo(
    () =>
      getAssignSubColumns(
        tableData,
        !props.actingAsEmployee,
        selectTitle,
        confirmReassign,
        isMobile,
        theme,
        classes,
        t
      ),
    [
      isMobile,
      props.actingAsEmployee,
      theme,
      classes,
      t,
      tableData,
      confirmReassign,
      selectTitle,
    ]
  );

  const isLoading = useMemo(() => {
    if (isForVacancy) {
      return (
        getReplacementEmployeesForNormalVacancyQuery.state === "LOADING" ||
        getReplacementEmployeesForNormalVacancyQuery.state === "UPDATING"
      );
    } else {
      return (
        getReplacementEmployeesForAbsenceVacancyQuery.state === "LOADING" ||
        getReplacementEmployeesForAbsenceVacancyQuery.state === "UPDATING"
      );
    }
  }, [
    isForVacancy,
    getReplacementEmployeesForAbsenceVacancyQuery.state,
    getReplacementEmployeesForNormalVacancyQuery.state,
  ]);

  const subHeader =
    !props.actingAsEmployee && props.employeeName ? (
      props.isEdit ? (
        <EmployeeLink orgUserId={props.employeeId} color="black">
          {props.employeeName}
        </EmployeeLink>
      ) : (
        props.employeeName
      )
    ) : (
      undefined
    );

  return (
    <>
      <ReassignAbsenceDialog
        open={reassignDialogIsOpen}
        onClose={() => setReassignDialogIsOpen(false)}
        onAssign={async () => {
          const validationCheck: ValidationChecks = {
            isQualified: validationChecks!.isQualified,
            isRejected: validationChecks!.isRejected,
            isMinorJobConflict: validationChecks!.isMinorJobConflict,
            excludedSub: validationChecks!.excludedSub,
            notIncluded: validationChecks!.notIncluded,
            unavailableToWork: validationChecks!.unavailableToWork,
          };

          setReassignDialogIsOpen(false);
          await assignReplacementEmployee(
            replacementEmployeeInfo.id,
            replacementEmployeeInfo.firstName,
            replacementEmployeeInfo.lastName,
            replacementEmployeeInfo.payCode,
            validationCheck
          );
        }}
        currentReplacementEmployee={employeeToReplace}
        newReplacementEmployee={`${replacementEmployeeInfo.firstName} ${replacementEmployeeInfo.lastName}`}
        isForVacancy={isForVacancy}
      />
      <AssignAbsenceDialog
        open={warningDialogIsOpen}
        employeeToAssign={`${replacementEmployeeInfo.firstName} ${replacementEmployeeInfo.lastName}`}
        messages={messages}
        onClose={() => setWarningDialogIsOpen(false)}
        onAssign={async () => {
          const validationCheck: ValidationChecks = {
            isQualified: validationChecks!.isQualified,
            isRejected: validationChecks!.isRejected,
            isMinorJobConflict: validationChecks!.isMinorJobConflict,
            excludedSub: validationChecks!.excludedSub,
            notIncluded: validationChecks!.notIncluded,
            unavailableToWork: validationChecks!.unavailableToWork,
          };
          setWarningDialogIsOpen(false);
          await assignReplacementEmployee(
            replacementEmployeeInfo.id,
            replacementEmployeeInfo.firstName,
            replacementEmployeeInfo.lastName,
            replacementEmployeeInfo.payCode,
            validationCheck,
            true
          );
        }}
      />
      <AbsenceVacancyHeader
        pageHeader={pageHeader}
        subHeader={subHeader}
        onCancel={props.onCancel}
        isForVacancy={isForVacancy}
      />
      <Section>
        <div className={classes.vacancyDetails}>{renderVacancyDetails()}</div>
        <Divider />

        <div className={classes.filters}>
          <Filters
            showQualifiedAndAvailable={!props.actingAsEmployee}
            setSearch={setSearch}
          />
        </div>
        <Divider />

        <div className={classes.substitutesList}>
          {isLoading ? (
            <Typography variant="h6">{t("Loading substitutes")}...</Typography>
          ) : (
            <Table
              title={`${replacementEmployeeCount} ${
                replacementEmployeeCount === 1
                  ? t("substitute")
                  : t("substitutes")
              }`}
              columns={columns}
              data={tableData}
              selection={false}
              style={{
                boxShadow: "initial",
              }}
              backgroundFillForAlternatingRows={true}
              /* As of 12/2/2019, we are not going to page this data.
                We will reintroduce pagining in the future.
              pagination={pagination}
              */
            />
          )}
        </div>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
  },
  confAndReturnContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  vacancyDetails: {
    marginBottom: theme.spacing(3),
  },
  vacancyDetailsTable: {
    width: "50%",
    border: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    paddingBottom: theme.spacing(),
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
  substitutesList: {
    marginTop: theme.spacing(2),
  },
  vacSubDetailContainer: {
    width: "50%",
    paddingTop: theme.spacing(),
  },
}));

const AbsenceVacancyInput = (
  vacancies: Vacancy[]
): AbsenceVacancyInputType | null => {
  const vacancy = vacancies[0];
  if (vacancy === undefined) {
    return null;
  }

  return {
    positionId: vacancy.positionId,
    needsReplacement: true,
    details: vacancy.details.map(d => {
      const startTimeLocal =
        d && d.startTimeLocal ? convertStringToDate(d.startTimeLocal) : null;
      const endTimeLocal =
        d && d.endTimeLocal ? convertStringToDate(d.endTimeLocal) : null;

      return {
        date: startTimeLocal ? format(startTimeLocal, "P") : null,
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
        locationId: d?.locationId ?? "",
      };
    }),
  };
};

const validator = (
  validationChecks: ValidationChecks,
  setMessages: any,
  t: any
) => {
  const messageArray = [];

  if (!validationChecks.isQualified) {
    const m = t("They are not qualified.");
    messageArray.push(m);
  }
  if (validationChecks.isRejected) {
    const m = t("They have rejected this job.");
    messageArray.push(m);
  }
  if (
    validationChecks.isMinorJobConflict &&
    validationChecks.unavailableToWork
  ) {
    const m = t("They are unavailable to work.");
    messageArray.push(m);
  } else if (validationChecks.isMinorJobConflict) {
    const m = t("They have a minor job conflict.");
    messageArray.push(m);
  }
  if (validationChecks.excludedSub) {
    const m = t("They have been blocked.");
    messageArray.push(m);
  }
  if (validationChecks.notIncluded) {
    const m = t("They are not included on any Favorite lists.");
    messageArray.push(m);
  }

  if (messageArray.length > 0) {
    messageArray.push(t("Do you wish to continue?"));
    const messages = uniq(compact(messageArray));
    setMessages(messages);

    return false;
  }

  return true;
};
