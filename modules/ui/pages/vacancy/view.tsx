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
import { Vacancy } from "graphql/server-types.gen";
import { useState, useEffect } from "react";
import { DeleteAbsenceVacancyDialog } from "ui/components/absence-vacancy/delete-absence-vacancy-dialog";
import { AdminHomeRoute } from "ui/routes/admin-home";
import { useHistory } from "react-router";
import { DeleteVacancy } from "./graphql/delete-vacancy.gen";

type Props = {};

export const VacancyView: React.FC<Props> = props => {
  const params = useRouteParams(VacancyViewRoute);
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();
  const [vacancyRowVersion, setVacancyRowVersion] = useState<string>();
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);

  const getVacancy = useQueryBundle(GetVacancyById, {
    variables: { id: params.vacancyId },
  });

  const [updateVacancy] = useMutationBundle(UpdateVacancy, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [deleteVacancy] = useMutationBundle(DeleteVacancy, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const goBack = React.useCallback(() => {
    history.push(AdminHomeRoute.generate(params));
  }, [history, params]);

  const onClickDelete = React.useCallback(() => setDeleteDialogIsOpen(true), [
    setDeleteDialogIsOpen,
  ]);
  const onDeleteVacancy = React.useCallback(async () => {
    const result = await deleteVacancy({
      variables: {
        vacancyId: params.vacancyId,
      },
    });
    setDeleteDialogIsOpen(false);
    if (result?.data) {
      openSnackbar({
        message: t("Vacancy #{{vacancyId}} has been deleted", {
          vacancyId: params.vacancyId,
        }),
        dismissable: true,
        status: "success",
        autoHideDuration: 5000,
      });
      goBack();
    }
  }, [deleteVacancy, params.vacancyId, openSnackbar, t, goBack]);

  useEffect(() => {
    if (
      getVacancy.state === "DONE" &&
      getVacancy?.data?.vacancy?.byId?.rowVersion &&
      (!vacancyRowVersion ||
        getVacancy?.data?.vacancy?.byId?.rowVersion > vacancyRowVersion)
    ) {
      setVacancyRowVersion(getVacancy?.data?.vacancy?.byId?.rowVersion);
    }
  }, [getVacancy]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const onUpdateVacancy = async (v: VacancyDetailsFormData) => {
    const vacUpdate = buildVacancyUpdateInput(v, vacancyRowVersion);
    const result = await updateVacancy({ variables: { vacancy: vacUpdate } });
    const vacancy = result?.data?.vacancy?.update as Vacancy;
    if (vacancy) {
      setVacancyRowVersion(vacancy.rowVersion);
      openSnackbar({
        message: t("The vacancy has been updated"),
        dismissable: true,
        status: "success",
        autoHideDuration: 5000,
      });
    }
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
      <DeleteAbsenceVacancyDialog
        objectType={"vacancy"}
        onDelete={onDeleteVacancy}
        onClose={() => setDeleteDialogIsOpen(false)}
        open={deleteDialogIsOpen}
        //replacementEmployeeName={replacementEmployeeName}
      />
      <VacancyUI
        vacancy={buildFormData(vacancy)}
        updateVacancy={onUpdateVacancy}
        onDelete={onClickDelete}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  title: { color: theme.customColors.primary },
}));
