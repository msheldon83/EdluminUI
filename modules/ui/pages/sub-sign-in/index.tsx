import { Typography, Divider, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useQueryBundle } from "graphql/hooks";
import { useQueryParamIso } from "hooks/query-params";
import { VacancyDetail } from "graphql/server-types.gen";
import * as React from "react";
import { useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouteParams } from "ui/routes/definition";
import { Select, OptionType } from "ui/components/form/select";
import { SubSignInRoute } from "ui/routes/sub-sign-in";
import { format, parse } from "date-fns";
import { GetFilledAbsences } from "./graphql/get-filled-absences.gen";
import { useLocations } from "reference-data/locations";
import { FilterQueryParams } from "./components/filter-param";
import { VacancyDetailRow } from "./components/vacancy-detail";
import { RedRoverLogo } from "ui/components/red-rover-logo";
import { Print } from "@material-ui/icons";

type Props = {};

export const SubSignInPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(SubSignInRoute);
  const [filterParams, updateFilterParams] = useQueryParamIso(
    FilterQueryParams
  );

  const date = filterParams.date;
  const dateLabel = format(parse(date, "P", new Date()), "EEEE, MMM d, yyyy");

  const locations = useLocations(params.organizationId);
  useEffect(() => {
    if (!filterParams.location && locations.length > 0) {
      updateFilterParams({ location: locations[0].id });
    }
  }, [locations, updateFilterParams, filterParams.location]);

  const location = useMemo(
    () =>
      locations.length > 0
        ? locations.find(x => x.id === filterParams.location.toString())
        : null,
    [locations, filterParams.location]
  );

  const locationOptions: OptionType[] = useMemo(
    () => locations.map(l => ({ label: l.name, value: l.id })),
    [locations]
  );
  const onChangeLocation = useCallback(
    (value: OptionType | OptionType[]) => {
      let id = null;
      if (Array.isArray(value)) {
        id = value[0].value;
      } else {
        id = value.value;
      }
      updateFilterParams({ location: id.toString() });
    },
    [updateFilterParams]
  );

  const getFilledAbsences = useQueryBundle(GetFilledAbsences, {
    variables: {
      orgId: params.organizationId,
      date,
      locationIds: [filterParams.location],
    },
    skip: !filterParams.location,
  });

  const vacancyDetails = useMemo(
    () =>
      (getFilledAbsences.state === "LOADING"
        ? []
        : getFilledAbsences.data?.absence?.subSignInReport ?? []) as Pick<
        VacancyDetail,
        | "id"
        | "startTimeLocal"
        | "endTimeLocal"
        | "assignment"
        | "vacancy"
        | "dayPortion"
        | "totalDayPortion"
        | "payInfo"
        | "vacancyReason"
      >[],
    [getFilledAbsences]
  );

  if (
    getFilledAbsences.state === "LOADING" ||
    !getFilledAbsences.data?.absence?.subSignInReport
  ) {
    return <></>;
  }

  return (
    <>
      <div className={classes.header}>
        <RedRoverLogo />
      </div>
      <div className={classes.title}>
        <Typography variant="h5">{`${location?.name} ${t(
          "Substitute Sign-in"
        )}`}</Typography>
        <Typography variant="h1">{dateLabel}</Typography>
      </div>
      <div className={classes.paper}>
        <Grid
          container
          spacing={2}
          className={classes.filter}
          alignItems="center"
          justify="space-between"
        >
          <Grid item xs={3}>
            <Select
              label={t("School")}
              onChange={onChangeLocation}
              value={locationOptions.find(
                e => e.value && e.value === location?.id
              )}
              options={locationOptions}
              multiple={false}
              withResetValue={false}
            />
          </Grid>
          <Grid item xs={3}></Grid>
          <Grid item xs={3}></Grid>
          <Grid item xs={3} container justify="flex-end">
            <Print
              className={[classes.action, classes.print].join(" ")}
              onClick={window.print}
            />
          </Grid>
        </Grid>
        <Divider />
        {vacancyDetails.map((v, i) => (
          <VacancyDetailRow key={i} vacancyDetail={v} shadeRow={i % 2 != 0} />
        ))}
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    width: "100%",
    backgroundColor: theme.customColors.edluminSlate,
    "@media print": {
      display: "none",
    },
  },
  title: {
    padding: theme.spacing(2),
    "@media print": {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  paper: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    "@media print": {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  divider: {
    "@media print": {
      display: "none",
    },
  },
  filter: {
    paddingBottom: theme.spacing(2),
    "@media print": {
      display: "none",
    },
  },
  action: {
    cursor: "pointer",
  },
  print: {
    "@media print": {
      display: "none",
    },
  },
}));
