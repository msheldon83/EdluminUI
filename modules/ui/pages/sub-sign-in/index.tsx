import { Button, Grid, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useQueryBundle } from "graphql/hooks";
import { PageTitle } from "ui/components/page-title";
import { OrgUser, VacancyDetail } from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { useRouteParams } from "ui/routes/definition";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { SubSignInRoute } from "ui/routes/sub-sign-in";
import { startOfToday, format } from "date-fns";
import { GetFilledAbsences } from "./graphql/get-filled-absences.gen";

type Props = {};

export const SubSignInPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const history = useHistory();
  const params = useRouteParams(SubSignInRoute);

  const today = useMemo(() => startOfToday(), []);
  const date = useMemo(() => format(today, "P"), [today]);

  const getFilledAbsences = useQueryBundle(GetFilledAbsences, {
    variables: {
      orgId: params.organizationId,
      date,
    },
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
      >[],
    [getFilledAbsences]
  );

  console.log(vacancyDetails);

  return (
    <>
      <Typography variant="h5">{`Location Placeholder ${t(
        "Subtitute Sign-in"
      )}`}</Typography>
      <Typography variant="h1">{format(today, "EEEE, MMM, d yyyy")}</Typography>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: 0,
  },
}));
