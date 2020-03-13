import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import { UnderConstructionHeader } from "ui/components/under-construction";
import { VacancyViewRoute } from "ui/routes/vacancy";
import { useTranslation } from "react-i18next";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { VacancyUI, VacancyDetailsFormData } from "./components/vacancy";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetVacancyById } from "./graphql/get-vacancy-byid.gen";
import { UpdateVacancy } from "./graphql/update-vacancy.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { buildFormData, buildVacancyUpdateInput } from "./helpers";

type Props = {};

export const VacancyView: React.FC<Props> = props => {
  const params = useRouteParams(VacancyViewRoute);
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const getVacancy = useQueryBundle(GetVacancyById, {
    variables: { id: params.vacancyId },
    fetchPolicy: "no-cache",
  });

  const [updateVacancy] = useMutationBundle(UpdateVacancy, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onUpdateVacancy = async (v: VacancyDetailsFormData) => {
    const vacUpdate = buildVacancyUpdateInput(v);
    const result = await updateVacancy({ variables: { vacancy: vacUpdate } });
    return result;
  };

  if (getVacancy.state === "LOADING") {
    return <></>;
  }
  const vacancy: any = getVacancy?.data?.vacancy?.byId ?? undefined;

  if (!Config.isDevFeatureOnly) {
    return (
      <>
        <PageTitle title={`${t("Create vacancy")}`} />
        <UnderConstructionHeader />
      </>
    );
  }

  return (
    <>
      <PageTitle title={t("Vacancy")} withoutHeading />
      <Typography className={classes.title} variant="h5">
        {t("Vacancy")}
      </Typography>
      <VacancyUI
        vacancy={buildFormData(vacancy)}
        updateVacancy={onUpdateVacancy}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  title: { color: theme.customColors.primary },
}));
