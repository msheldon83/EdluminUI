import {
  makeStyles,
  Grid,
  Typography,
  IconButton,
  ClickAwayListener,
} from "@material-ui/core";
import InputBase from "@material-ui/core/InputBase";
import { fade } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useDeferredState } from "hooks";
import { useEffect } from "react";
import { useQueryBundle } from "graphql/hooks";
import { GetSearchResultsByConfirmationId } from "ui/app-chrome/graphql/get-search-results-by-confirmation-id.gen";
import CircularProgress from "@material-ui/core/CircularProgress";
import CloseIcon from "@material-ui/icons/Close";
import { format, parseISO } from "date-fns";
import { useMyUserAccess } from "reference-data/my-user-access";
import { AppChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import {
  AdminEditAbsenceRoute,
  EmployeeEditAbsenceRoute,
} from "ui/routes/edit-absence";
import { VacancyViewRoute } from "ui/routes/vacancy";
import { useHistory } from "react-router";
import { Can } from "ui/components/auth/can";
import { PermissionEnum } from "graphql/server-types.gen";

type Props = {
  className?: string;
};

export const SearchBar: React.FC<Props> = props => {
  const classes = useStyles();
  const inputClasses = useInputStyles();
  const { t } = useTranslation();
  const userAccess = useMyUserAccess();
  const params = useRouteParams(AppChromeRoute);
  const absenceEditParams = useRouteParams(AdminEditAbsenceRoute);
  const history = useHistory();

  /**** Because this component is not under an AdminRouteOrganizationContextProvider */
  /****  we need to do this to grab the org id. */
  /**** Our Logic is if the user is in the admin context of a specific org, */
  /**** we will send that org.  For every other context we will not send orgs and allow */
  /**** the server to decide which orgs the user has access to */

  const orgIds: string[] | undefined =
    window.location.pathname.includes("admin") &&
    window.location.pathname.split("/")[2]
      ? [window.location.pathname.split("/")[2]]
      : undefined;

  const [loading, updateLoading] = React.useState(false);
  const [openDrawer, updateOpenDrawer] = React.useState(false);

  const [
    confirmationId,
    pendingConfirmationId,
    setPendingConfirmationId,
  ] = useDeferredState<any>("", 200);

  const updateSearch = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateLoading(event.target.value !== "" ? true : false);
      setPendingConfirmationId(event.target.value);
      if (event.target.value === "") {
        updateOpenDrawer(false);
      }
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
      updateOpenDrawer(pendingConfirmationId !== "");
    }
  }, [searchResults, loading, setPendingConfirmationId, pendingConfirmationId]);

  const results =
    searchResults.state === "DONE" || searchResults.state === "UPDATING"
      ? searchResults?.data?.absence?.byConfirmationId
      : [];

  const handleOnClick = (id: string, objectTypeId: string) => {
    onClose();
    if (params.role === "admin") {
      if (objectTypeId === "VACANCY") {
        goToAdminVacancyEdit(id);
      } else {
        goToAdminAbsenceEdit(id);
      }
    } else {
      goToEmployeeAbsenceEdit(id);
    }
  };

  const goToAdminAbsenceEdit = (absenceId: string) => {
    const url = AdminEditAbsenceRoute.generate({
      organizationId: window.location.pathname.split("/")[2],
      absenceId,
    });
    history.push(url);
  };

  const goToAdminVacancyEdit = (vacancyId: string) => {
    const url = VacancyViewRoute.generate({
      organizationId: window.location.pathname.split("/")[2],
      vacancyId,
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
  const handleClickAway = () => {
    onClose();
  };

  const onClose = () => {
    setPendingConfirmationId("");
    updateOpenDrawer(false);
  };

  return (
    <Can do={[PermissionEnum.AbsVacView]}>
      <ClickAwayListener onClickAway={handleClickAway}>
        <div className={`${classes.search} ${props.className}`}>
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
          {results && openDrawer && (
            <Grid className={classes.resultContainer} container spacing={2}>
              {results.length == 0 && (
                <Grid className={classes.resultItem} item xs={12}>
                  <Typography align="center">{t("No Results")}</Typography>
                </Grid>
              )}
              {results.map((r: any, i) => {
                const heading: string =
                  r.objectTypeId === "VACANCY"
                    ? r.assignmentId
                      ? `${t("Vacancy")} #${r.id} (${t("Assignment")} #C${
                          r.assignmentId
                        })`
                      : `${t("Vacancy")} #${r.id}`
                    : r.assignmentId
                    ? `${t("Absence")} #${r.id} (${t("Assignment")} #C${
                        r.assignmentId
                      })`
                    : `${t("Absence")} #${r.id}`;
                const subHeading = `${format(
                  parseISO(r.absenceStartTimeUtc),
                  "EEE, MMM d, yyyy"
                )}`;
                const empName = r.employeeFirstName
                  ? `${r.employeeFirstName} ${r.employeeLastName}`
                  : r.employeeLastName;
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
                      <span className={classes.highlight}>
                        {confirmationId}
                      </span>
                    </div>
                  );
                });

                return (
                  <Grid className={classes.resultItem} item xs={12} key={i}>
                    <div onClick={() => handleOnClick(r.id, r.objectTypeId)}>
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
                        {r.assignmentId && (
                          <span className={classes.label}>
                            {t("filled by")}
                          </span>
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
      </ClickAwayListener>
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
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  resultContainer: {
    position: "fixed",
    marginTop: theme.typography.pxToRem(2),
    boxShadow: "5px 5px 5px 0px rgba(0,0,0,0.24)",
    cursor: "pointer",
    width: "50%",
    overflow: "hidden",
    borderBottomRightRadius: theme.typography.pxToRem(10),
    borderBottomLeftRadius: theme.typography.pxToRem(10),
  },
  resultItem: {
    backgroundColor: theme.customColors.white,
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    borderBottom: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
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
