import { useTheme } from "@material-ui/styles";
import { Grid, makeStyles, Checkbox } from "@material-ui/core";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { VacancyReasonRoute } from "ui/routes/vacancy-reason";
import { useRouteParams } from "ui/routes/definition";
import {
  PermissionEnum,
  VacancyReasonCreateInput,
  VacancyReasonUpdateInput,
} from "graphql/server-types.gen";
import { EditableTable } from "ui/components/editable-table";
import { ShowErrors, ShowGenericErrors } from "ui/components/error-helpers";
import * as Yup from "yup";
import { useSnackbar } from "hooks/use-snackbar";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { GetAllVacancyReasonsWithinOrg } from "./graphql/get-vacancy-reasons.gen";
import { UpdateVacancyReason } from "./graphql/update-vacancy-reason.gen";
import { CreateVacancyReason } from "./graphql/create-vacancy-reason.gen";
import { DeleteVacancyReason } from "./graphql/delete-vacancy-reason.gen";
import { Column } from "material-table";
import { compact } from "lodash-es";
import { GetVacancyReasonsDocument } from "reference-data/get-vacancy-reasons.gen";
import { boolean } from "@storybook/addon-knobs";

type Props = {};

export const VacancyReason: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(VacancyReasonRoute);
  const { openSnackbar } = useSnackbar();

  const vacancyReasonsReferenceQuery = {
    query: GetVacancyReasonsDocument,
    variables: { orgId: params.organizationId },
  };

  const getVacancyReasons = useQueryBundle(GetAllVacancyReasonsWithinOrg, {
    variables: { orgId: params.organizationId, includeExpired: true },
  });

  const [updateVacancyReason] = useMutationBundle(UpdateVacancyReason, {
    refetchQueries: [vacancyReasonsReferenceQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [createVacancyReason] = useMutationBundle(CreateVacancyReason, {
    refetchQueries: [vacancyReasonsReferenceQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [deleteVacancyReasonMutation] = useMutationBundle(DeleteVacancyReason, {
    refetchQueries: [vacancyReasonsReferenceQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const vacancyReasonInput: VacancyReasonCreateInput = {
    orgId: params.organizationId,
    name: "",
    externalId: null,
    description: null,
    code: null,
  };

  const columns: Column<GetAllVacancyReasonsWithinOrg.All>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      editable: "always",
    },
    {
      title: t("Identifier"),
      field: "externalId",
      hidden: isMobile,
      editable: "always",
    },
    {
      title: t("Code"),
      field: "code",
      hidden: isMobile,
      editable: "always",
    },
    {
      title: t("Requires Approval"),
      field: "requiresApproval",
      hidden: isMobile,
      type: "boolean",
      editable: "always",
      editComponent: props => {
        return (
          <Checkbox
            color="primary"
            checked={props.value}
            value={props.value}
            onChange={e => props.onChange(e.target.checked)}
          />
        );
      },
    },
    {
      title: t("Description"),
      field: "description",
      hidden: isMobile,
      editable: "always",
    },
  ];

  const validateVacancyReason = React.useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .nullable()
          .required(t("Name is required")),
        externalId: Yup.string().nullable(),
        description: Yup.string().nullable(),
        code: Yup.string().nullable(),
      }),
    [t]
  );

  if (getVacancyReasons.state === "LOADING") {
    return <></>;
  }

  const vacancyReasons = compact(
    getVacancyReasons?.data?.orgRef_VacancyReason?.all ?? []
  );

  const vacancyReasonCount = vacancyReasons.length;

  const addVacancyReason = async (vacancyReason: VacancyReasonCreateInput) => {
    validateVacancyReason.validate(vacancyReason).catch(function(err) {
      ShowGenericErrors(err, openSnackbar);
    });
    const result = await createVacancyReason({
      variables: {
        vacancyReason: {
          ...vacancyReasonInput,
          name: vacancyReason.name,
          externalId: vacancyReason.externalId,
          description: vacancyReason.description,
          code: vacancyReason.code,
          requiresApproval: vacancyReason.requiresApproval,
        },
      },
    });
    if (!result?.data) return false;
    return true;
  };

  const editVacancyReason = async (vacancyReason: VacancyReasonUpdateInput) => {
    validateVacancyReason.validate(vacancyReason).catch(function(err) {
      ShowGenericErrors(err, openSnackbar);
    });
    const result = await updateVacancyReason({
      variables: {
        vacancyReason: {
          id: vacancyReason.id,
          rowVersion: vacancyReason.rowVersion,
          name: vacancyReason.name,
          externalId: vacancyReason.externalId,
          description: vacancyReason.description,
          code: vacancyReason.code,
          requiresApproval: vacancyReason.requiresApproval,
        },
      },
    });
    if (!result?.data) return false;
    return true;
  };

  const deleteVacancyReason = (vacancyReasonId: string) => {
    return deleteVacancyReasonMutation({
      variables: {
        vacancyReasonId: vacancyReasonId,
      },
    });
  };

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        justify="space-between"
        spacing={2}
        className={classes.header}
      >
        <Grid item>
          <PageTitle title={t("Vacancy Reasons")} />
        </Grid>
      </Grid>

      <EditableTable
        title={`${vacancyReasonCount} ${t("Vacancy Reasons")}`}
        columns={columns}
        data={vacancyReasons}
        onRowAdd={{
          action: async newData => {
            const newVacancyReason = {
              ...vacancyReasonInput,
              name: newData.name,
              externalId: newData.externalId,
              description: newData.description,
              code: newData.code,
              requiresApproval: newData.requiresApproval,
            };
            const result = await addVacancyReason(newVacancyReason);
            if (!result) throw Error("Preserve Row on error");
            if (result) await getVacancyReasons.refetch();
          },
          permissions: [PermissionEnum.AbsVacSettingsSave],
        }}
        onRowUpdate={{
          action: async newData => {
            const updateVacancyReason = {
              id: newData.id,
              rowVersion: newData.rowVersion,
              name: newData.name,
              externalId: newData.externalId,
              description: newData.description,
              code: newData.code,
              requiresApproval: newData.requiresApproval,
            };
            const result = await editVacancyReason(updateVacancyReason);
            if (!result) throw Error("Preserve Row on error");
            if (result) await getVacancyReasons.refetch();
          },
          permissions: [PermissionEnum.AbsVacSettingsSave],
        }}
        onRowDelete={{
          action: async oldData => {
            await deleteVacancyReason(String(oldData.id));
            await getVacancyReasons.refetch();
          },
          permissions: [PermissionEnum.AbsVacSettingsSave],
        }}
        options={{
          search: true,
        }}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(),
  },
}));
