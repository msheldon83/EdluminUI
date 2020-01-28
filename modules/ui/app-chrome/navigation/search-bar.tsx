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

  /**** This is some crazy logic to get the org id because it is not available in the route yet. */
  /**** We are assuming if the user is not an admin that they only have access to one org */
  let orgId = "0";
  if (userAccess != null) {
    if (userAccess.isSysAdmin) {
      orgId = "0";
    } else {
      orgId = userAccess?.permissionsByOrg[0].orgId;
    }
  }
  orgId = window.location.pathname.includes("admin")
    ? window.location.pathname.split("/")[2]
    : orgId;
  /****************************************************** */

  const [open, setOpen] = React.useState(false);
  const [searchFilter, updateSearchFilter] = React.useState<{
    confirmationId: string | undefined;
  }>({
    confirmationId: "",
  });

  const [loading, updateLoading] = React.useState(false);

  const [
    confirmationId,
    pendingConfirmationId,
    setPendingConfirmationId,
  ] = useDeferredState<string | undefined>("", 200);

  useEffect(() => {
    if (confirmationId !== searchFilter.confirmationId) {
      setPendingConfirmationId(searchFilter.confirmationId);
    }
  }, [searchFilter]);

  useEffect(() => {
    if (confirmationId !== searchFilter.confirmationId) {
      updateSearchFilter({ confirmationId });
    }
  }, [confirmationId]);

  const updateSearch = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingConfirmationId(event.target.value);
      updateLoading(event.target.value !== "" ? true : false);
    },
    [setPendingConfirmationId]
  );

  const searchResults = useQueryBundle(GetSearchResultsByConfirmationId, {
    fetchPolicy: "cache-first",
    variables: {
      ...searchFilter,
      orgId: orgId,
      isSysAdmin: userAccess?.isSysAdmin,
    },
    skip:
      confirmationId == undefined || userAccess == null || confirmationId == "",
  });

  if (searchResults.state === "DONE" && loading === true) {
    updateLoading(false);
  }
  const results =
    searchResults.state === "DONE" || searchResults.state === "UPDATING"
      ? searchResults?.data?.absence?.byConfirmationId
      : [];

  if (searchResults.state === "DONE" && !open) {
    setOpen(true);
  }
  const handleOnClick = (absId: string) => {
    onClose();
    if (params.role === "admin") {
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
  const handleClickAway = () => {
    onClose();
  };

  const onClose = () => {
    setPendingConfirmationId("");
    results?.splice(0, results?.length);
    setOpen(false);
  };

  return (
    <Can do={[PermissionEnum.AbsVacView]}>
      <ClickAwayListener onClickAway={handleClickAway}>
        <div className={`${classes.search} ${props.className}`}>
          <div className={classes.searchIcon}>
            <SearchIcon />
          </div>
          <InputBase
            placeholder={t("search", "Search")}
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

          {results && open && (
            <Grid className={classes.resultContainer} container spacing={2}>
              {results.length == 0 && (
                <Grid className={classes.resultItem} item xs={12}>
                  <Typography align="center">No Results</Typography>
                </Grid>
              )}
              {results.map((r: any, i) => {
                const heading: string = r.assignmentId
                  ? `Absence #${r.absenceId} (Assignment #${r.assignmentId})`
                  : `Absence #${r.absenceId}`;
                const subHeading = `${format(
                  parseISO(r.absenceStartTimeUtc),
                  "ddd, MMM d, yyyy"
                )}`;
                const empName = `${r.employeeFirstName} ${r.employeeLastName}`;
                const subName = `${r.subFirstName} ${r.subLastName}`;

                const arr =
                  searchFilter.confirmationId === undefined
                    ? []
                    : heading.split(searchFilter.confirmationId);
                const newArr = arr.map((a, i) => {
                  return i == arr.length - 1 ? (
                    a
                  ) : (
                    <div key={i} className={classes.inlineBlock}>
                      {a}
                      <span className={classes.highlight}>
                        {searchFilter.confirmationId}
                      </span>
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
                        <span className={classes.label}>on</span>
                        <span className={classes.data}>{subHeading}</span>
                        <span className={classes.label}>for</span>
                        <span className={classes.data}>{empName}</span>
                        {r.assignmentId && (
                          <span className={classes.label}>filled by</span>
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
    marginTop: "2px",
    boxShadow: "5px 5px 5px 0px rgba(0,0,0,0.24)",
    cursor: "pointer",
    width: "50%",
    overflow: "hidden",
    borderBottomRightRadius: "10px",
    borderBottomLeftRadius: "10px",
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
    fontSize: "16px",
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
