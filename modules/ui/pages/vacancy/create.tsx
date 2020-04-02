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
import { VacancyUI } from "./components/vacancy";
import { buildVacancyCreateInput } from "./helpers";
import { VacancyDetailsFormData } from "./helpers/types";

type Props = {};

export const VacancyCreate: React.FC<Props> = props => {
  const params = useRouteParams(VacancyCreateRoute);
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const defaultVacancyCreateInput: VacancyDetailsFormData = {
    orgId: params.organizationId,
    title: "",
    isClosed: false,
    positionTypeId: "",
    contractId: "",
    locationId: "",
    locationName: "",
    workDayScheduleId: "",
    closedDetails: [],
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

  return (
    <>
      <PageTitle title={t("Create vacancy")} withoutHeading />
      <Typography className={classes.title} variant="h5">
        {t("Create vacancy")}
      </Typography>
      <VacancyUI
        initialVacancy={defaultVacancyCreateInput}
        createVacancy={onCreateVacancy}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  title: { color: theme.customColors.primary },
}));
