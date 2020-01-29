import * as React from "react";
import { Can } from "ui/components/auth/can";
import { PermissionEnum } from "graphql/server-types.gen";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import { makeStyles, Grid, Typography, IconButton } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import CloseIcon from "@material-ui/icons/Close";
import { useEffect } from "react";
import { useMyUserAccess } from "reference-data/my-user-access";
import {
  AdminEditAbsenceRoute,
  EmployeeEditAbsenceRoute,
} from "ui/routes/edit-absence";
import { useRouteParams } from "ui/routes/definition";
import { useHistory } from "react-router";
import { AppChromeRoute } from "ui/routes/app-chrome";
import { useQueryBundle } from "graphql/hooks";
import { format, parseISO } from "date-fns";
import { fade } from "@material-ui/core/styles";
import { useDeferredState } from "hooks";
import { GetSearchResultsByConfirmationId } from "ui/app-chrome/graphql/get-search-results-by-confirmation-id.gen";
import { useTranslation } from "react-i18next";
import { useOrganizationId } from "core/org-context";

type Props = { className?: string; role: string };

export const MobileSearchBar: React.FC<Props> = props => {
  const classes = useStyles();
  const inputClasses = useInputStyles();
  const userAccess = useMyUserAccess();
  const params = useRouteParams(AppChromeRoute);
  const history = useHistory();
  const { t } = useTranslation();
  const contextOrgId = useOrganizationId();

  /**** If the user is in the admin context of a specific org, */
  /**** we will send that org.  For every other context we will not send orgs and allow */
  /**** the server to decide which orgs the user has access to */
  const orgIds: string[] | undefined = !contextOrgId
    ? undefined
    : [contextOrgId];

  /*const [open, setOpen] = React.useState(false);
  const [searchFilter, updateSearchFilter] = React.useState<{
    confirmationId: any;
  }>({
    confirmationId: "",
  });*/

  const [loading, updateLoading] = React.useState(false);

  const [
    confirmationId,
    pendingConfirmationId,
    setPendingConfirmationId,
  ] = useDeferredState<any>("", 200);

  /*useEffect(() => {
    if (confirmationId !== searchFilter.confirmationId) {
      setPendingConfirmationId(searchFilter.confirmationId);
    }
  }, [searchFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (confirmationId !== searchFilter.confirmationId) {
      updateSearchFilter({ confirmationId });
    }
  }, [confirmationId]); // eslint-disable-line react-hooks/exhaustive-deps
*/
  const updateSearch = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateLoading(event.target.value !== "" ? true : false);
      setPendingConfirmationId(event.target.value);
    },
    [setPendingConfirmationId]
  );

  const searchResults = useQueryBundle(GetSearchResultsByConfirmationId, {
    fetchPolicy: "cache-first",
    variables: {
      confirmationId,
      orgIds,
    },
    skip:
      confirmationId == undefined || userAccess == null || confirmationId == "",
  });

  useEffect(() => {
    if (searchResults.state === "DONE" && loading) {
      updateLoading(false);
    }
  }, [searchResults, loading, setPendingConfirmationId]);

  const results =
    searchResults.state === "DONE" || searchResults.state === "UPDATING"
      ? searchResults?.data?.absence?.byConfirmationId
      : [];

  const handleOnClick = (absId: string) => {
    onClose();
    if (props.role === "admin") {
      goToAdminAbsenceEdit(absId);
    } else {
      goToEmployeeAbsenceEdit(absId);
    }
  };

  const goToAdminAbsenceEdit = (absenceId: string) => {
    const url = AdminEditAbsenceRoute.generate({
      organizationId: window.location.pathname.split("/")[2],
      absenceId,
    });
    history.push(url);
  };

  const goToEmployeeAbsenceEdit = (absenceId: string) => {
    history.push(
      EmployeeEditAbsenceRoute.generate({
        absenceId: absenceId,
      })
    );
  };

  const onClose = () => {
    setPendingConfirmationId("");
  };

  return (
    <Can do={[PermissionEnum.AbsVacView]}>
      <div className={`${classes.search} ${props.className}`}>
        <div>
          <div className={classes.searchIcon}>
            <SearchIcon />
          </div>
          <InputBase
            placeholder={t("Search")}
            classes={inputClasses}
            inputProps={{ "aria-label": "search" }}
            value={pendingConfirmationId}
            onChange={updateSearch}
            endAdornment={
              results?.length !== 0 && loading === false ? (
                <React.Fragment>
                  <IconButton
                    key="close"
                    aria-label="close"
                    color="inherit"
                    onClick={onClose}
                  >
                    <CloseIcon />
                  </IconButton>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                </React.Fragment>
              )
            }
          />
        </div>

        {results && results.length > 0 && (
          <Grid className={classes.resultContainer} container spacing={2}>
            {results.length == 0 && (
              <Grid className={classes.resultItem} item xs={12}>
                <Typography align="center">{t("No Results")}</Typography>
              </Grid>
            )}
            {results.map((r: any, i) => {
              const heading: string = r.assignmentId
                ? `${t("Absence")} #${r.absenceId} (${t("Assignment")} #${
                    r.assignmentId
                  })`
                : `${t("Absence")} #${r.absenceId}`;
              const subHeading = `${format(
                parseISO(r.absenceStartTimeUtc),
                "EEE, MMM d, yyyy"
              )}`;
              const empName = `${r.employeeFirstName} ${r.employeeLastName}`;
              const subName = `${r.subFirstName} ${r.subLastName}`;

              const arr =
                confirmationId === undefined
                  ? []
                  : heading.split(confirmationId);
              const newArr = arr.map((a, i) => {
                return i == arr.length - 1 ? (
                  a
                ) : (
                  <div key={i} className={classes.inlineBlock}>
                    {a}
                    <span className={classes.highlight}>{confirmationId}</span>
                  </div>
                );
              });

              return (
                <Grid className={classes.resultItem} item xs={12} key={i}>
                  <div onClick={() => handleOnClick(r.absenceId)}>
                    <div className={classes.header}>
                      {newArr.map(a => {
                        return a;
                      })}
                    </div>
                    <div>
                      <span className={classes.label}>{t("on")}</span>
                      <span className={classes.data}>{subHeading}</span>
                      <span className={classes.label}>{t("for")}</span>
                      <span className={classes.data}>{empName}</span>
                    </div>
                    <div>
                      {r.assignmentId && (
                        <span className={classes.label}>{t("filled by")}</span>
                      )}
                      {r.assignmentId && <span>{subName}</span>}
                    </div>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        )}
      </div>
    </Can>
  );
};

const useStyles = makeStyles(theme => ({
  search: {
    color: theme.customColors.black,
    position: "relative",
    borderRadius: theme.typography.pxToRem(5),
    backgroundColor: fade(theme.palette.common.white, 0.15),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "auto",
    },
  },
  searchIcon: {
    color: "inherit",
    opacity: 0.7,
    width: theme.spacing(7),
    height: theme.typography.pxToRem(36),
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  resultContainer: {
    cursor: "pointer",
    marginTop: theme.typography.pxToRem(2),
  },
  resultItem: {
    backgroundColor: theme.customColors.white,
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    borderBottom: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    padding: `${theme.typography.pxToRem(20)} !important`,
  },
  label: {
    color: theme.customColors.darkGray,
    marginRight: theme.spacing(1),
  },
  data: {
    marginRight: theme.spacing(1),
  },
  inlineBlock: {
    display: "inline",
  },
  header: {
    fontWeight: "bold",
    fontSize: theme.typography.pxToRem(16),
  },
  highlight: {
    backgroundColor: theme.customColors.gray,
  },
}));

const useInputStyles = makeStyles(theme => ({
  root: {
    color: "inherit",
  },
  input: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: 200,
    },
  },
}));
