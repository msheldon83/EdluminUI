import { Grid, makeStyles } from "@material-ui/core";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import * as Yup from "yup";
import { compact } from "lodash-es";
import { EditableTable } from "ui/components/editable-table";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import {
  WorkDayScheduleVariantTypeCreateInput,
  WorkDayScheduleVariantTypeUpdateInput,
} from "graphql/server-types.gen";
import { ShowErrors, ShowGenericErrors } from "ui/components/error-helpers";
import { Column } from "material-table";
import { useSnackbar } from "hooks/use-snackbar";
import { CreateWorkDayScheduleVariantType } from "./graphql/create.gen";
import { UpdateWorkDayScheduleVariantType } from "./graphql/update.gen";
import { DeleteWorkDayScheduleVariantType } from "./graphql/delete.gen";
import { GetAllWorkDayScheduleVariantTypesInOrg } from "./graphql/get-all-bell-schedule-variants.gen";
import { BellScheduleVariantsIndexRoute } from "ui/routes/bell-schedule-variants";

type Props = {};

export const BellScheduleVariants: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(BellScheduleVariantsIndexRoute);
  const [includeExpired, setIncludeExpired] = React.useState(false);

  const [createWorkDayScheduleVariantType] = useMutationBundle(
    CreateWorkDayScheduleVariantType,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const [updateWorkDayScheduleVariantType] = useMutationBundle(
    UpdateWorkDayScheduleVariantType,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const [deleteWorkDayScheduleVariantTypeMutation] = useMutationBundle(
    DeleteWorkDayScheduleVariantType,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const getAllWorkDayScheduleVariantTypes = useQueryBundle(
    GetAllWorkDayScheduleVariantTypesInOrg,
    {
      variables: { orgId: params.organizationId, includeExpired },
    }
  );

  const validateWorkDayScheduleVariantType = React.useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .nullable()
          .required(t("Name is required")),
        externalId: Yup.string().nullable(),
        description: Yup.string().nullable(),
      }),
    [t]
  );

  const [workDayScheduleVariantType] = React.useState<
    WorkDayScheduleVariantTypeCreateInput
  >({
    orgId: Number(params.organizationId),
    name: "",
    externalId: null,
    description: "",
    isStandard: false,
  });

  const create = async (
    workDayScheduleVariantType: WorkDayScheduleVariantTypeCreateInput
  ) => {
    validateWorkDayScheduleVariantType
      .validate(workDayScheduleVariantType, { abortEarly: false })
      .catch(function(err) {
        ShowGenericErrors(err, openSnackbar);
      });
    const result = await createWorkDayScheduleVariantType({
      variables: {
        workDayScheduleVariantType,
      },
    });
    if (result === undefined) return false;
    return true;
  };
  const update = async (
    workDayScheduleVariantType: WorkDayScheduleVariantTypeUpdateInput
  ) => {
    validateWorkDayScheduleVariantType
      .validate(workDayScheduleVariantType, { abortEarly: false })
      .catch(function(err) {
        ShowGenericErrors(err, openSnackbar);
      });
    const result = await updateWorkDayScheduleVariantType({
      variables: {
        workDayScheduleVariantType,
      },
    });
    if (result === undefined) return false;
    return true;
  };
  const deleteWorkDayScheduleVariantType = (
    workDayScheduleVariantTypeId: string
  ) => {
    const result = deleteWorkDayScheduleVariantTypeMutation({
      variables: {
        workDayScheduleVariantTypeId: Number(workDayScheduleVariantTypeId),
      },
    });
  };

  const columns: Column<GetAllWorkDayScheduleVariantTypesInOrg.All>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
      editable: "always",
    },
    {
      title: t("External Id"),
      field: "externalId",
      searchable: true,
      hidden: isMobile,
      editable: "always",
    },

    {
      title: t("Description"),
      field: "description",
      searchable: true,
      hidden: isMobile,
      editable: "always",
    },
  ];

  if (getAllWorkDayScheduleVariantTypes.state === "LOADING") {
    return <></>;
  }

  const workDayScheduleVariantTypes = compact(
    getAllWorkDayScheduleVariantTypes?.data?.orgRef_WorkDayScheduleVariantType
      ?.all ?? []
  );
  const mappedData = workDayScheduleVariantTypes.map(o => ({
    ...o,
    description: o.description?.toString(),
    externalId: o.externalId?.toString(),
  }));
  const workDayScheduleVariantTypesCount = workDayScheduleVariantTypes.length;

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
          <PageTitle title={t("Bell Schedule Variants")} />
        </Grid>
      </Grid>
      <EditableTable
        title={`${workDayScheduleVariantTypesCount} ${t(
          "Bell Schedule Variants"
        )}`}
        columns={columns}
        data={mappedData}
        editableRows={v => !v.isStandard}
        deletableRows={v => !v.isStandard}      
        onRowAdd={async newData => {
          const newWorkDayScheduleVariantType = {
            ...workDayScheduleVariantType,
            name: newData.name,
            externalId:
              !newData.externalId || newData.externalId.trim().length === 0
                ? null
                : newData.externalId,
            description:
              !newData.description || newData.description.trim().length === 0
                ? null
                : newData.description,
          };
          const result = await create(newWorkDayScheduleVariantType);
          if (!result) throw Error("Preserve Row on error");
          if (result) await getAllWorkDayScheduleVariantTypes.refetch();
        }}
        onRowUpdate={async newData => {
          const updateWorkDayScheduleVariantType = {
            id: Number(newData.id),
            rowVersion: newData.rowVersion,
            name: newData.name,
            externalId:
              !newData.externalId || newData.externalId.trim().length === 0
                ? null
                : newData.externalId,
            isStandard: newData.isStandard,
            description:
              !newData.description || newData.description.trim().length === 0
                ? null
                : newData.description,
          };
          const result = await update(updateWorkDayScheduleVariantType);
          if (!result) throw Error("Preserve Row on error");
          if (result) await getAllWorkDayScheduleVariantTypes.refetch();
        }}
        onRowDelete={async oldData => {
          if (oldData.isStandard) {
            const errors = ["The standard schedule variant cannot be removed."];
            ShowGenericErrors({ errors }, openSnackbar);
            return;
          }
          deleteWorkDayScheduleVariantType(String(oldData.id));
          await getAllWorkDayScheduleVariantTypes.refetch();
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
  checkbox: {
    disabled: "true",
  },
}));
