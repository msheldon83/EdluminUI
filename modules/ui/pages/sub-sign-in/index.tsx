import { Typography, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useQueryBundle } from "graphql/hooks";
import { useQueryParamIso } from "hooks/query-params";
import { VacancyDetail } from "graphql/server-types.gen";
import * as React from "react";
import { useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouteParams } from "ui/routes/definition";
import { SelectNew as Select, OptionType } from "ui/components/form/select-new";
import { SubSignInRoute } from "ui/routes/sub-sign-in";
import { startOfToday, format } from "date-fns";
import { GetFilledAbsences } from "./graphql/get-filled-absences.gen";
import { useLocations } from "reference-data/locations";
import { FilterQueryParams } from "./components/location-param";
import { VacancyDetailRow } from "./components/vacancy-detail";
import { useOrgVacancyDayConversions } from "reference-data/org-vacancy-day-conversions";
import { EdluminLogo } from "ui/components/edlumin-logo";

type Props = {};

export const SubSignInPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(SubSignInRoute);
  const [locationParam, updateLocationParam] = useQueryParamIso(
    FilterQueryParams
  );

  const vacancyDayConversions = useOrgVacancyDayConversions(
    params.organizationId
  );

  const today = useMemo(() => startOfToday(), []);
  const date = useMemo(() => format(today, "P"), [today]);

  const locations = useLocations(params.organizationId);
  useEffect(() => {
    if (
      (isNaN(locationParam.location) || locationParam.location === 0) &&
      locations.length > 0
    ) {
      updateLocationParam({ location: Number(locations[0].id) });
    }
  }, [locations, updateLocationParam, locationParam.location]);

  const location = useMemo(
    () =>
      locations.length > 0
        ? locations.find(x => x.id === locationParam.location.toString())
        : null,
    [locations, locationParam.location]
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
      updateLocationParam({ location: Number(id) });
    },
    [updateLocationParam]
  );

  const getFilledAbsences = useQueryBundle(GetFilledAbsences, {
    variables: {
      orgId: params.organizationId,
      date,
      locationIds: [locationParam.location],
    },
    skip: isNaN(locationParam.location),
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
        | "actualDuration"
        | "payDurationOverride"
        | "payTypeId"
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
        <EdluminLogo />
      </div>
      <div className={classes.title}>
        <Typography variant="h5">{`${location?.name} ${t(
          "Substitute Sign-in"
        )}`}</Typography>
        <Typography variant="h1">
          {format(today, "EEEE, MMM d, yyyy")}
        </Typography>
      </div>
      <div className={classes.paper}>
        <div className={classes.filter}>
          <Select
            label={t("School")}
            onChange={onChangeLocation}
            value={locationOptions.find(
              e => e.value && e.value === location?.id
            )}
            options={locationOptions}
          />
        </div>
        <Divider />
        {vacancyDetails.map((v, i) => (
          <VacancyDetailRow
            key={i}
            vacancyDetail={v}
            shadeRow={i % 2 != 0}
            vacancyDayConversions={vacancyDayConversions}
          />
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
    width: "30%",
  },
}));
