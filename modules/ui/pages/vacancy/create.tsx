import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import { UnderConstructionHeader } from "ui/components/under-construction";
import { VacancyCreateRoute } from "ui/routes/vacancy";
import { useTranslation } from "react-i18next";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useMutationBundle } from "graphql/hooks";
import { CreateVacancy } from "./graphql/create-vacancy.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { VacancyUI, VacancyDetailsFormData } from "./components/vacancy";
import { buildVacancyCreateInput } from "./helpers";

type Props = {};

export const VacancyCreate: React.FC<Props> = props => {
  const params = useRouteParams(VacancyCreateRoute);
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const defaultVacancyCreateInput: VacancyDetailsFormData = {
    orgId: params.organizationId,
    title: "",
    positionTypeId: "",
    contractId: "",
    locationId: "",
    workDayScheduleId: "",
    details: [],
    id: "",
    rowVersion: "",
  };

  const [createVacancy] = useMutationBundle(CreateVacancy, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onCreateVacancy = async (v: VacancyDetailsFormData) => {
    const vacCreate = buildVacancyCreateInput(v);
    const result = await createVacancy({ variables: { vacancy: vacCreate } });
    return result;
  };
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
      <PageTitle title={t("Create vacancy")} withoutHeading />
      <Typography className={classes.title} variant="h5">
        {t("Create vacancy")}
      </Typography>
      <VacancyUI
        vacancy={defaultVacancyCreateInput}
        createVacancy={onCreateVacancy}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  title: { color: theme.customColors.primary },
}));