import { Button, Collapse, Divider, Link, Typography } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/styles";
import format from "date-fns/format";
import { useQueryBundle } from "graphql/hooks";
import { AbsenceVacancyInput, Vacancy } from "graphql/server-types.gen";
import { convertStringToDate } from "helpers/date";
import { parseTimeFromString, secondsSinceMidnight } from "helpers/time";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { Table } from "ui/components/table";
import { AssignAbsenceDialog } from "ui/components/assign-absence-dialog";
import { GetReplacementEmployeesForVacancy } from "ui/pages/create-absence/graphql/get-replacement-employees.gen";
import { VacancyDetails } from "../../../components/absence/vacancy-details";
import { AssignSubColumn, getAssignSubColumns } from "./columns";
import { compact, uniq } from "lodash-es";
import {
  AssignSubFilters as Filters,
  ReplacementEmployeeFilters,
} from "./filters";
import { ReassignAbsenceDialog } from "ui/components/absence/reassign-dialog";
import { AssignmentOnDate } from "ui/components/absence/types";
import { AbsenceHeader } from "ui/components/absence/header";

type Props = {
  orgId: string;
  absenceId?: string;
  existingVacancy?: boolean;
  vacancies: Vacancy[];
  vacancyDetailIdsToAssign?: string[];
  userIsAdmin: boolean;
  employeeName: string;
  employeeId?: string;
  positionId?: string;
  positionName?: string;
  disabledDates?: Date[];
  selectButtonText?: string;
  onAssignReplacement: (
    replacementId: string,
    replacementName: string,
    payCode: string | undefined,
    vacancyDetailIds?: string[]
  ) => void;
  onCancel: () => void;
  employeeToReplace?: string;
  assignmentsByDate: AssignmentOnDate[];
};

export type ValidationChecks = {
  isQualified: boolean;
  isRejected: boolean;
  isMinorJobConflict: boolean;
  excludedSub: boolean;
  notIncluded: boolean;
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
  } = props;

  const [reassignDialogIsOpen, setReassignDialogIsOpen] = React.useState(false);
  const [warningDialogIsOpen, setWarningDialogIsOpen] = React.useState(false);
  const [
    replacementEmployeeName,
    setReplacementEmployeeName,
  ] = React.useState();
  const [
    replacementEmployeePayCode,
    setReplacementEmployeePayCode,
  ] = React.useState();
  const [replacementEmployeeId, setReplacementEmployeeId] = React.useState();
  const [unavailableToWork, setUnavailableToWork] = React.useState();
  const [isQualified, setIsQualified] = React.useState();
  const [isRejected, setIsRejected] = React.useState();
  const [isMinorJobConflict, setIsMinorJobConflict] = React.useState();
  const [excludedSub, setExcludedSub] = React.useState();
  const [notIncluded, setNotIncluded] = React.useState();

  //Absence Dialog box props. Possibly
  const [title, setTitle] = React.useState();
  const [messages, setMessages] = React.useState<string[]>([]);

  // If we don't have any info, cancel the Assign Sub action
  if (!props.vacancies || props.vacancies.length === 0) {
    props.onCancel();
  }

  // Vacancy Details collapse configuration
  const collapsedVacancyDetailsHeight = 200;
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
  const getReplacementEmployeesForVacancyQuery = useQueryBundle(
    GetReplacementEmployeesForVacancy,
    {
      variables: {
        orgId: props.orgId,
        vacancyId: props.vacancies[0]?.id ?? undefined,
        vacancy: !props.vacancies[0]?.id
          ? buildVacancyInput(props.vacancies)
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
      skip: searchFilter === undefined,
    }
  );

  useEffect(() => {
    if (searchFilter) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
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

  const assignReplacementEmployee = useCallback(
    async (
      replacementEmployeeId: string,
      name: string,
      payCodeId: string | undefined,
      validationChecks: ValidationChecks,
      unavailableToWork: boolean,
      ignoreAndContinue?: boolean
    ) => {
      if (
        !validator(
          validationChecks,
          unavailableToWork,
          setMessages,
          setTitle,
          t
        ) &&
        !ignoreAndContinue
      ) {
        setReplacementEmployeeName(name);
        setReplacementEmployeePayCode(payCodeId);
        setReplacementEmployeeId(replacementEmployeeId);
        setUnavailableToWork(unavailableToWork);
        setIsQualified(isQualified);
        setIsRejected(isRejected);
        setIsMinorJobConflict(isMinorJobConflict);
        setExcludedSub(excludedSub);
        setNotIncluded(notIncluded);
        setWarningDialogIsOpen(true);
      } else {
        onAssignReplacement(
          replacementEmployeeId,
          name,
          payCodeId,
          vacancyDetailIdsToAssign
        );
      }
    },
    [onAssignReplacement, vacancyDetailIdsToAssign]
  );

  const confirmReassign = useCallback(
    async (
      replacementEmployeeId: string,
      name: string,
      payCodeId: string | undefined,
      unavailableToWork: boolean,
      validationChecks: ValidationChecks
    ) => {
      if (employeeToReplace) {
        setReplacementEmployeeName(name);
        setReplacementEmployeePayCode(payCodeId);
        setReplacementEmployeeId(replacementEmployeeId);
        setUnavailableToWork(unavailableToWork);
        setReassignDialogIsOpen(true);
      } else {
        await assignReplacementEmployee(
          replacementEmployeeId,
          name,
          payCodeId,
          validationChecks,
          unavailableToWork
        );
      }
    },
    [assignReplacementEmployee, employeeToReplace]
  );

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
            vacancyDetailIds={vacancyDetailIdsToAssign}
            positionName={props.positionName}
            gridRef={vacancyDetailsRef}
            showHeader
            disabledDates={props.disabledDates}
            detailsClassName={classes.vacancyDetailsTable}
            assignmentsByDate={props.assignmentsByDate}
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

  const replacementEmployeeCount = replacementEmployees.length;
  const pageHeader = props.existingVacancy
    ? t("Assign Substitute")
    : `${t("Create Absence")}: ${t("Prearranging Substitute")}`;

  const selectTitle = props.selectButtonText || t("Select")!;
  const columns = useMemo(
    () =>
      getAssignSubColumns(
        tableData,
        props.userIsAdmin,
        selectTitle,
        confirmReassign,
        isMobile,
        theme,
        classes,
        t
      ),
    [
      isMobile,
      props.userIsAdmin,
      theme,
      classes,
      t,
      tableData,
      confirmReassign,
      selectTitle,
    ]
  );

  const isLoading =
    getReplacementEmployeesForVacancyQuery.state === "LOADING" ||
    getReplacementEmployeesForVacancyQuery.state === "UPDATING";

  return (
    <>
      <ReassignAbsenceDialog
        open={reassignDialogIsOpen}
        onClose={() => setReassignDialogIsOpen(false)}
        onAssign={async () => {
          const validationChecks: ValidationChecks = {
            isQualified: isQualified,
            isRejected: isRejected,
            isMinorJobConflict: isMinorJobConflict,
            excludedSub: excludedSub,
            notIncluded: notIncluded,
          };

          setReassignDialogIsOpen(false);
          await assignReplacementEmployee(
            replacementEmployeeId,
            replacementEmployeeName,
            replacementEmployeePayCode,
            validationChecks,
            unavailableToWork
          );
        }}
        currentReplacementEmployee={employeeToReplace}
        newReplacementEmployee={replacementEmployeeName}
      />
      <AssignAbsenceDialog
        open={warningDialogIsOpen}
        title={title}
        messages={messages}
        onClose={() => setWarningDialogIsOpen(false)}
        onAssign={async () => {
          const validationChecks: ValidationChecks = {
            isQualified: isQualified,
            isRejected: isRejected,
            isMinorJobConflict: isMinorJobConflict,
            excludedSub: excludedSub,
            notIncluded: notIncluded,
          };

          setWarningDialogIsOpen(false);
          await assignReplacementEmployee(
            replacementEmployeeId,
            replacementEmployeeName,
            replacementEmployeePayCode,
            validationChecks,
            unavailableToWork,
            true
          );
        }}
      />
      <AbsenceHeader
        absenceId={props.absenceId}
        userIsAdmin={props.userIsAdmin}
        employeeName={props.employeeName}
        pageHeader={pageHeader}
        onCancel={props.onCancel}
      />
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
}));

const buildVacancyInput = (
  vacancies: Vacancy[]
): AbsenceVacancyInput | null => {
  const vacancy = vacancies[0];
  if (vacancy === undefined) {
    return null;
  }

  return {
    positionId: vacancy.positionId,
    needsReplacement: true,
    details: vacancy.details!.map(d => {
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

//TODO: remove corresponding checks from the back-end
const validator = (
  validationChecks: ValidationChecks,
  unavailableToWork: boolean,
  setMessages: any,
  setTitle: any,
  t: any
) => {
  const messageArray = [];

  if (!validationChecks.isQualified) {
    const m = t("Employee is not qualified for this Vacancy.");
    messageArray.push(m);
  }
  if (validationChecks.isRejected) {
    const m = t("Employee has rejected this absence.");
    messageArray.push(m);
  }
  if (validationChecks.isMinorJobConflict) {
    const m = t("Employee has a minor job conflict.");
    messageArray.push(m);
  }
  if (validationChecks.excludedSub) {
    const m = t("Employee has been rejected from the replacement pool.");
    messageArray.push(m);
  }
  if (validationChecks.notIncluded) {
    const m = t("Employee has not been included in any replacement pools.");
    messageArray.push(m);
  }
  if (unavailableToWork) {
    const m = t("Employee is unavailable to work.");
    messageArray.push(m);
  }

  if (messageArray.length > 0) {
    messageArray.push(t("Do you wish to continue?"));
    const messages = uniq(compact(messageArray));
    setTitle(t("Warning!"));
    setMessages(messages);

    return false;
  }

  return true;
};
