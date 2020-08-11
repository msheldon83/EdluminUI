import * as React from "react";
import { Can } from "ui/components/auth/can";
import { PermissionEnum } from "graphql/server-types.gen";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import {
  makeStyles,
  Grid,
  Typography,
  IconButton,
  Chip,
} from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import CloseIcon from "@material-ui/icons/Close";
import { useEffect } from "react";
import { useMyUserAccess } from "reference-data/my-user-access";
import {
  AdminEditAbsenceRoute,
  EmployeeEditAbsenceRoute,
} from "ui/routes/absence";
import { useRouteParams } from "ui/routes/definition";
import { useHistory } from "react-router";
import { AppChromeRoute } from "ui/routes/app-chrome";
import { useQueryBundle } from "graphql/hooks";
import { format, parseISO } from "date-fns";
import { fade } from "@material-ui/core/styles";
import { useDeferredState } from "hooks";
import { useTranslation } from "react-i18next";
import { useOrganizationId } from "core/org-context";
import { GetGlobalSearchResults } from "../graphql/global-search.gen";
import { VacancyViewRoute } from "ui/routes/vacancy";
import { LocationViewRoute } from "ui/routes/locations";
import { PersonViewRoute } from "ui/routes/people";
import { formatPhoneNumber } from "../helpers/index";

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

  const [loading, updateLoading] = React.useState(false);
  const [openDrawer, updateOpenDrawer] = React.useState(false);

  const [
    searchTerm,
    pendingSearchTerm,
    setPendingSearchTerm,
  ] = useDeferredState<any>("", 200);

  const updateSearch = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      updateLoading(event.target.value !== "" ? true : false);
      setPendingSearchTerm(event.target.value);
      if (event.target.value === "") {
        updateOpenDrawer(false);
      }
    },
    [setPendingSearchTerm]
  );

  const searchResults = useQueryBundle(GetGlobalSearchResults, {
    fetchPolicy: "cache-first",
    variables: {
      searchTerm,
      orgIds,
    },
    skip: searchTerm == undefined || userAccess == null || searchTerm == "",
  });

  useEffect(() => {
    if (searchResults.state === "DONE" && loading) {
      updateLoading(false);
      updateOpenDrawer(pendingSearchTerm !== "");
    }
  }, [searchResults, loading, setPendingSearchTerm, pendingSearchTerm]);

  const results =
    searchResults.state === "DONE" || searchResults.state === "UPDATING"
      ? searchResults?.data?.organization?.search
      : [];

  const handleAbsVacOnClick = (id: string, isNormalVacancy: boolean) => {
    onClose();
    if (params.role === "admin") {
      if (isNormalVacancy) {
        goToAdminVacancyEdit(id);
      } else {
        goToAdminAbsenceEdit(id);
      }
    } else {
      goToEmployeeAbsenceEdit(id);
    }
  };

  const handleLocationOnClick = (id: string) => {
    onClose();
    const url = LocationViewRoute.generate({
      organizationId: window.location.pathname.split("/")[2],
      locationId: id,
    });
    history.push(url);
  };

  const handleOrgUserOnClick = (id: string) => {
    onClose();
    const url = PersonViewRoute.generate({
      organizationId: window.location.pathname.split("/")[2],
      orgUserId: id,
    });
    history.push(url);
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

  const onClose = () => {
    setPendingSearchTerm("");
    updateOpenDrawer(false);
  };

  const highlightSearchTerm = (s: string, searchTerm: string) => {
    const sLower = s.toLowerCase();
    const stLower = searchTerm.toLowerCase();
    const arr = searchTerm === undefined ? [] : sLower.split(stLower);
    const lengthArr = arr.map(a => a.length);
    let pointer = 0;
    return arr.map((a, i) => {
      pointer =
        i === 0 ? pointer : pointer + lengthArr[i - 1] + searchTerm.length;
      return i == arr.length - 1 ? (
        s.substr(pointer, lengthArr[i])
      ) : (
        <div key={i} className={classes.inlineBlock}>
          {s.substr(pointer, lengthArr[i])}
          <span className={classes.highlight}>
            {s.substr(lengthArr[i] + pointer, searchTerm.length)}
          </span>
        </div>
      );
    });
  };

  const renderAbsVacAssignmentResult = (result: any, i: number) => {
    const attributes = JSON.parse(result.objectJson);

    const heading: string =
      attributes.assignmentId !== 0
        ? `${result.ownerId} (${t("Assignment")} #C${attributes.assignmentId})`
        : `${result.ownerId}`;

    const subHeading = `${format(
      parseISO(attributes.absenceStartTimeUTC),
      "EEE, MMM d, yyyy"
    )}`;
    const empName = attributes.employeeFirstName
      ? `${attributes.employeeFirstName} ${attributes.employeeLastName}`
      : attributes.employeeLastName;
    const subName = `${attributes.subFirstName} ${attributes.subLastName}`;
    const headingArr = highlightSearchTerm(heading, searchTerm);
    headingArr.unshift(
      attributes.isNormalVacancy === 1
        ? `${t("Vacancy")} #V`
        : `${t("Absence")} #`
    );

    return (
      <Grid className={classes.resultItem} item xs={12} key={i}>
        <div
          onClick={() =>
            handleAbsVacOnClick(
              result.ownerId,
              attributes.isNormalVacancy === 1
            )
          }
        >
          <div className={classes.header}>
            {headingArr.map(a => {
              return a;
            })}
          </div>
          <div>
            <span className={classes.label}>{t("on")}</span>
            <span className={classes.data}>{subHeading}</span>
          </div>
          <div>
            <span className={classes.label}>{t("for")}</span>
            <span className={classes.data}>{empName}</span>
          </div>
          {attributes.assignmentId !== 0 && (
            <div>
              <span className={classes.label}>{t("filled by")}</span>

              {attributes.assignmentId && <span>{subName}</span>}
            </div>
          )}
        </div>
      </Grid>
    );
  };

  const renderLocationResult = (result: any, i: number) => {
    const attributes = JSON.parse(result.objectJson);
    const nameArray = highlightSearchTerm(attributes.name, searchTerm);
    const phoneArray = attributes.phoneNumber
      ? highlightSearchTerm(
          formatPhoneNumber(attributes.phoneNumber),
          searchTerm
        )
      : [];
    const externalArray = attributes.externalId
      ? highlightSearchTerm(attributes.externalId, searchTerm)
      : [];

    return (
      <Grid className={classes.resultItem} item xs={12} key={i}>
        <div onClick={() => handleLocationOnClick(result.ownerId)}>
          <div className={classes.header}>
            {nameArray.map(a => {
              return a;
            })}
          </div>
          <div>
            {phoneArray.length > 0 && (
              <>
                <span className={classes.label}>{t("phone")}</span>

                <span className={classes.data}>
                  {phoneArray.map(a => {
                    return a;
                  })}
                </span>
              </>
            )}
          </div>
          <div>
            {externalArray.length > 0 && (
              <>
                <span className={classes.label}>{t("identifier")}</span>
                <span className={classes.data}>
                  {externalArray.map(a => {
                    return a;
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </Grid>
    );
  };

  const renderPeopleResult = (result: any, i: number) => {
    const attributes = JSON.parse(result.objectJson);
    let name = attributes.firstName ? attributes.firstName : "";
    name = attributes.middleName ? `${name} ${attributes.middleName}` : name;
    name = attributes.lastName ? `${name} ${attributes.lastName}` : name;
    const nameArray = highlightSearchTerm(name, searchTerm);
    const phoneArray = attributes.phoneNumber
      ? highlightSearchTerm(
          formatPhoneNumber(attributes.phoneNumber),
          searchTerm
        )
      : [];
    const emailArray = attributes.email
      ? highlightSearchTerm(attributes.email, searchTerm)
      : [];
    const externalArray = attributes.externalId
      ? highlightSearchTerm(attributes.externalId, searchTerm)
      : [];

    return (
      <Grid className={classes.resultItem} item xs={12} key={i}>
        <div onClick={() => handleOrgUserOnClick(result.ownerId)}>
          <div className={classes.header}>
            {nameArray.map(a => {
              return a;
            })}
          </div>
          <div className={classes.chipContainer}>
            {attributes.isEmployee === "1" && (
              <Typography className={classes.chip} variant="caption">
                {t("Employee")}
              </Typography>
            )}
            {attributes.isAdmin === "1" && (
              <Typography className={classes.chip} variant="caption">
                {t("Administrator")}
              </Typography>
            )}
            {attributes.isSub === "1" && (
              <Typography className={classes.chip} variant="caption">
                {t("Substitute")}
              </Typography>
            )}
          </div>
          <div>
            {phoneArray.length > 0 && (
              <>
                <span className={classes.label}>{t("phone")}</span>

                <span className={classes.data}>
                  {phoneArray.map(a => {
                    return a;
                  })}
                </span>
              </>
            )}
          </div>
          <div>
            {emailArray.length > 0 && (
              <>
                <span className={classes.label}>{t("email")}</span>

                <span className={classes.data}>
                  {emailArray.map(a => {
                    return a;
                  })}
                </span>
              </>
            )}
          </div>
          <div>
            {externalArray.length > 0 && (
              <>
                <span className={classes.label}>{t("identifier")}</span>
                <span className={classes.data}>
                  {externalArray.map(a => {
                    return a;
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </Grid>
    );
  };

  const absVacResults = results
    ? results?.filter(r => {
        return (
          r?.objectTypeId === "ABSENCE" ||
          r?.objectTypeId === "VACANCY" ||
          r?.objectTypeId === "ASSIGNMENT"
        );
      })
    : [];

  const locationResults = results
    ? results?.filter(r => {
        return r?.objectTypeId === "LOCATION";
      })
    : [];

  const peopleResults = results
    ? results?.filter(r => {
        return r?.objectTypeId === "ORG_USER";
      })
    : [];

  return (
    <div className={`${classes.search} ${props.className}`}>
      <div>
        <div className={classes.searchIcon}>
          <SearchIcon />
        </div>
        <InputBase
          placeholder={t("Search")}
          classes={inputClasses}
          inputProps={{ "aria-label": "search" }}
          value={pendingSearchTerm}
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

      {results && openDrawer && (
        <Grid className={classes.resultContainer} container spacing={2}>
          {results.length == 0 && (
            <Grid className={classes.resultItem} item xs={12}>
              <Typography align="center">{t("No Results")}</Typography>
            </Grid>
          )}
          {absVacResults.length > 0 && (
            <>
              <Grid item xs={12} className={classes.categoryTitle}>
                <Typography variant="h6">{t("Absences/Vacancies")}</Typography>
              </Grid>
              {absVacResults.map((r: any, i) => {
                return renderAbsVacAssignmentResult(r, i);
              })}
            </>
          )}
          {locationResults.length > 0 && (
            <>
              <Grid item xs={12} className={classes.categoryTitle}>
                <Typography variant="h6">{t("Schools")}</Typography>
              </Grid>
              {locationResults.map((r: any, i) => {
                return renderLocationResult(r, i);
              })}
            </>
          )}
          {peopleResults.length > 0 && (
            <>
              <Grid item xs={12} className={classes.categoryTitle}>
                <Typography variant="h6">{t("People")}</Typography>
              </Grid>
              {peopleResults.map((r: any, i) => {
                return renderPeopleResult(r, i);
              })}
            </>
          )}
        </Grid>
      )}
    </div>
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
    fontSize: theme.typography.pxToRem(13),
  },
  data: {
    marginRight: theme.spacing(1),
    fontSize: theme.typography.pxToRem(13),
  },
  inlineBlock: {
    display: "inline",
  },
  header: {
    fontWeight: 500,
    fontSize: theme.typography.pxToRem(16),
  },
  highlight: {
    backgroundColor: theme.customColors.gray,
  },
  categoryTitle: {
    backgroundColor: theme.customColors.white,
    fontSize: theme.typography.pxToRem(14),
    fontWeight: "normal",
    color: theme.customColors.darkGray,
  },
  chipContainer: {
    marginLeft: theme.typography.pxToRem(-8),
  },
  chip: {
    display: "inline",
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
    color: theme.customColors.gray,
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
