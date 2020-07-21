import {
  Button,
  Divider,
  Grid,
  IconButton,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { FilterList } from "@material-ui/icons";
import RefreshIcon from "@material-ui/icons/Refresh";
import { parseISO, isBefore } from "date-fns";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import {
  PersonalPreference,
  PermissionEnum,
  PreferenceFilter,
} from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { AvailableJob } from "./components/available-job";
import { RequestAbsenceDialog } from "./components/request-dialog";
import { FilterQueryParams } from "./filters/filter-params";
import { Filters } from "./filters/index";
import { DismissVacancy } from "./graphql/dismiss-vacancy.gen";
import { RequestVacancy } from "./graphql/request-vacancy.gen";
import { SubJobSearch } from "./graphql/sub-job-search.gen";
import { Can } from "ui/components/auth/can";
import { compact } from "lodash-es";
import { ConfirmOverrideDialog } from "./components/confirm-override";

type Props = {
  viewingAsAdmin?: boolean;
  userId?: string;
  orgUsers?: {
    id: string;
    orgId: string;
  }[];
  refetchAssignments?: () => Promise<void>;
};

export const AvailableAssignments: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const { openSnackbar } = useSnackbar();
  const [showFilters, setShowFilters] = React.useState(!isMobile);
  React.useEffect(() => setShowFilters(!isMobile), [isMobile]);

  const { userId, orgUsers } = props;

  const [requestAbsenceIsOpen, setRequestAbsenceIsOpen] = React.useState(false);
  const [overrideDialogOpen, setOverrideDialogOpen] = React.useState(false);
  const [employeeId, setEmployeeId] = React.useState<string | null>(null);
  const [vacancyId, setVacancyId] = React.useState<string | null>(null);
  const [dismissedAssignments, setDismissedAssignments] = React.useState<
    string[]
  >([]);
  const [dismissVacancyMutation] = useMutationBundle(DismissVacancy, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [requestVacancyMutation] = useMutationBundle(RequestVacancy, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [{ preferenceFilter, ...filters }] = useQueryParamIso(
    FilterQueryParams
  );

  const isPersonalPreference = (s: string): s is PersonalPreference =>
    Object.keys(PersonalPreference).includes(s);

  const getVacancies = useQueryBundle(
    SubJobSearch,
    //r => r.vacancy?.subJobSearch?.totalCount,
    {
      variables: {
        ...filters,
        id: userId ?? "",
      },
      skip: !userId,
    }
  );

  const vacancies = useMemo(
    () =>
      getVacancies.state === "DONE" || getVacancies.state === "UPDATING"
        ? compact(getVacancies.data.vacancy?.subJobSearch?.results) ?? []
        : [],
    [getVacancies]
  );

  const preferenceMatchesFilter = React.useCallback(
    (result: PersonalPreference | null) => {
      switch (preferenceFilter) {
        case PreferenceFilter.ShowFavorites:
          return result === PersonalPreference.Favorite;
        case PreferenceFilter.ShowFavoritesAndDefault:
          return result === PersonalPreference.Favorite || result === null;
        default:
          return true;
      }
    },
    [preferenceFilter]
  );

  const sortedVacancies = useMemo(
    () =>
      vacancies
        .filter(
          x =>
            !dismissedAssignments.includes(x?.vacancy.id ?? "") &&
            preferenceMatchesFilter(x?.locationPreferenceId ?? null)
        )
        .sort((a, b) =>
          isBefore(
            parseISO(a?.vacancy.startTimeLocal),
            parseISO(b?.vacancy.startTimeLocal)
          )
            ? -1
            : 1
        ),
    [vacancies, dismissedAssignments, preferenceMatchesFilter]
  );
  const onRefreshVacancies = async () => await getVacancies.refetch();

  const onDismissVacancy = async (vacancyId: string) => {
    const employeeId = determineEmployeeId(vacancyId);
    if (employeeId != 0) {
      setDismissedAssignments([...dismissedAssignments, vacancyId]);
      await Promise.resolve(
        dismissVacancyMutation({
          variables: {
            vacancyRejection: {
              vacancyId: vacancyId,
              employeeId: employeeId,
            },
          },
        })
      );
    }
    await getVacancies.refetch();
  };

  const determineEmployeeId = (vacancyId: string) => {
    const orgId =
      sortedVacancies.find(o => o.vacancy.id === vacancyId)?.vacancy.orgId ??
      "";
    const employeeId = orgUsers?.find(o => o.orgId === orgId)?.id ?? 0;
    return employeeId;
  };

  const onCloseRequestAbsenceDialog = async () => {
    setRequestAbsenceIsOpen(false);
    await getVacancies.refetch();
    if (props.refetchAssignments) {
      await props.refetchAssignments();
    }
  };

  const onAcceptVacancy = async (
    vacancyId: string,
    unavailableToWork?: boolean,
    overridePreferred?: boolean
  ) => {
    if (unavailableToWork && !overridePreferred) {
      setVacancyId(vacancyId);
      setOverrideDialogOpen(true);
    } else {
      setOverrideDialogOpen(false);
      const employeeId = determineEmployeeId(vacancyId);
      if (employeeId != 0) {
        await requestVacancyMutation({
          variables: {
            vacancyRequest: {
              vacancyId: vacancyId,
              employeeId: employeeId,
            },
          },
        });
      }
      setEmployeeId(employeeId.toString());
      setVacancyId(vacancyId);
      setRequestAbsenceIsOpen(true);
    }
  };

  return (
    <>
      <Can do={[PermissionEnum.AbsVacAssign]}>
        <Section className={classes.wrapper}>
          <Grid container spacing={2} className={classes.header}>
            <Typography variant="h5" className={classes.availableJobsTitle}>
              {t("Available assignments")}
            </Typography>

            {isMobile ? (
              <div className={classes.jobButtons}>
                <IconButton onClick={onRefreshVacancies}>
                  <RefreshIcon />
                </IconButton>
              </div>
            ) : (
              <div className={classes.jobButtons}>
                <Button variant="outlined" onClick={onRefreshVacancies}>
                  {t("Refresh")}
                </Button>
              </div>
            )}
          </Grid>
          {isMobile && (
            <div className={classes.filterButton}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {t("Filters")}
              </Button>
            </div>
          )}

          {showFilters && <Filters userId={userId ?? ""} />}
          <div>
            <Divider className={classes.header} />
            {getVacancies.state === "LOADING" ? (
              <Typography variant="h5">
                {t("Loading available assignments")}
              </Typography>
            ) : vacancies.length > 0 ? (
              sortedVacancies.map((x, index) => (
                <AvailableJob
                  vacancy={x?.vacancy}
                  unavailableToWork={x?.unavailableToWork ?? false}
                  shadeRow={index % 2 != 0}
                  onDismiss={onDismissVacancy}
                  key={index}
                  onAccept={onAcceptVacancy}
                  viewingAsAdmin={props.viewingAsAdmin}
                />
              ))
            ) : (
              <Typography variant="h5">
                {t("No assignments available")}
              </Typography>
            )}
          </div>
        </Section>
      </Can>

      <RequestAbsenceDialog
        open={requestAbsenceIsOpen}
        onClose={onCloseRequestAbsenceDialog}
        employeeId={employeeId}
        vacancyId={vacancyId}
      />

      <ConfirmOverrideDialog
        open={overrideDialogOpen}
        vacancyId={vacancyId}
        setOverrideDialogOpen={setOverrideDialogOpen}
        onAccept={onAcceptVacancy}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  filterButton: {
    paddingLeft: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
  header: {
    marginBottom: theme.spacing(2),
    position: "relative",
  },
  availableJobsTitle: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(2),
  },
  title: {
    marginBottom: 0,
  },
  wrapper: {
    position: "relative",

    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0),
      paddingTop: theme.spacing(2),
    },
  },
  jobButtons: {
    position: "absolute",
    top: "0",
    right: "12px",
  },
}));
