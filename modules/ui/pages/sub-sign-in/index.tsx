import { Button, Grid, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useQueryBundle } from "graphql/hooks";
import { useQueryParamIso } from "hooks/query-params";
import { PageTitle } from "ui/components/page-title";
import { OrgUser, VacancyDetail } from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { useRouteParams } from "ui/routes/definition";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { SubSignInRoute } from "ui/routes/sub-sign-in";
import { startOfToday, format } from "date-fns";
import { GetFilledAbsences } from "./graphql/get-filled-absences.gen";
import { useLocations } from "reference-data/locations";
import { OptionType, Select } from "ui/components/form/select";
import {
  FilterQueryParams,
  LocationsQueryFilters,
} from "./components/location-param";
import { VacancyDetailRow } from "./components/vacancy-detail";
import { useOrgVacancyDayConversions } from "reference-data/org-vacancy-day-conversions";

type Props = {};

export const SubSignInPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const history = useHistory();
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
  const onChangeLocations = useCallback(
    (value /* OptionType */) => {
      const id: number = value
        ? value.map((v: OptionType) => Number(v.value))
        : [];
      updateLocationParam({ location: id });
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

  console.log(vacancyDetails);

  return (
    <>
      <Typography variant="h5">{`${location?.name} ${t(
        "Subtitute Sign-in"
      )}`}</Typography>
      <Typography variant="h1">{format(today, "EEEE, MMM, d yyyy")}</Typography>
      {vacancyDetails.map((v, i) => (
        <VacancyDetailRow
          key={i}
          vacancyDetail={v}
          shadeRow={i % 2 != 0}
          vacancyDayConversions={vacancyDayConversions}
        />
      ))}
    </>
  );
};

const useStyles = makeStyles(theme => ({}));
