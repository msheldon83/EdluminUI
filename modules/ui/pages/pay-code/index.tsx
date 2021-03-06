import { Grid, makeStyles, TextField } from "@material-ui/core";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import { compact } from "lodash-es";
import { EditableTable } from "ui/components/editable-table";
import { PageTitle } from "ui/components/page-title";
import {
  PayCodeCreateInput,
  PayCodeUpdateInput,
  PermissionEnum,
  DataImportType,
} from "graphql/server-types.gen";
import { Column } from "material-table";
import { useSnackbar } from "hooks/use-snackbar";
import { CreatePayCode } from "./graphql/create.gen";
import { PayCodeIndexRoute } from "ui/routes/pay-code";
import { useRouteParams } from "ui/routes/definition";
import { GetAllPayCodesWithinOrg } from "./graphql/get-pay-codes.gen";
import { UpdatePayCode } from "./graphql/update-pay-code.gen";
import { DeletePayCode } from "./graphql/delete-pay-code.gen";
import { ShowErrors, ShowGenericErrors } from "ui/components/error-helpers";
import { useOrganizationId } from "core/org-context";
import { GetPayCodesDocument } from "reference-data/get-pay-codes.gen";
import { ImportDataButton } from "ui/components/data-import/import-data-button";
import { Can } from "ui/components/auth/can";

type Props = {};

export const PayCode: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const orgId = useOrganizationId();

  const payCodesReferenceDataQuery = {
    query: GetPayCodesDocument,
    variables: { orgId },
  };

  const [createPayCode] = useMutationBundle(CreatePayCode, {
    refetchQueries: [payCodesReferenceDataQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [updatePayCode] = useMutationBundle(UpdatePayCode, {
    refetchQueries: [payCodesReferenceDataQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const params = useRouteParams(PayCodeIndexRoute);
  const { openSnackbar } = useSnackbar();
  const [includeExpired, setIncludeExpired] = React.useState(false);

  const getPayCodes = useQueryBundle(GetAllPayCodesWithinOrg, {
    variables: { orgId: params.organizationId, includeExpired },
  });
  const [deletePayCodeMutation] = useMutationBundle(DeletePayCode, {
    refetchQueries: [payCodesReferenceDataQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const deletePayCode = (payCodeId: string) => {
    return deletePayCodeMutation({
      variables: {
        payCodeId: payCodeId,
      },
    });
  };

  const validatePayCode = React.useMemo(
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

  const [payCode] = React.useState<PayCodeCreateInput>({
    orgId: params.organizationId,
    name: "",
    externalId: null,
    description: "",
    code: "",
  });

  const create = async (payCode: PayCodeCreateInput) => {
    validatePayCode
      .validate(payCode, { abortEarly: false })
      .catch(function(err) {
        ShowGenericErrors(err, openSnackbar);
      });
    const result = await createPayCode({
      variables: {
        payCode,
      },
    });
    if (result === undefined) return false;
    return true;
  };

  const update = async (payCode: PayCodeUpdateInput) => {
    validatePayCode
      .validate(payCode, { abortEarly: false })
      .catch(function(err) {
        ShowGenericErrors(err, openSnackbar);
      });
    const result = await updatePayCode({
      variables: {
        payCode,
      },
    });
    if (result === undefined) return false;
    return true;
  };

  const columns: Column<GetAllPayCodesWithinOrg.All>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
      editable: "always",
      editComponent: props => (
        <TextField
          fullWidth
          value={props.value}
          onChange={e => props.onChange(e.target.value)}
        />
      ),
    },
    {
      title: t("Identifier"),
      field: "externalId",
      searchable: true,
      hidden: isMobile,
      editable: "always",
      editComponent: props => (
        <TextField
          fullWidth
          value={props.value}
          onChange={e => props.onChange(e.target.value)}
        />
      ),
    },
    {
      title: t("Code"),
      field: "code",
      searchable: true,
      hidden: isMobile,
      editable: "always",
      editComponent: props => (
        <TextField
          fullWidth
          value={props.value}
          onChange={e => props.onChange(e.target.value)}
        />
      ),
    },
    {
      title: t("Description"),
      field: "description",
      searchable: true,
      hidden: isMobile,
      editable: "always",
      editComponent: props => (
        <TextField
          fullWidth
          value={props.value}
          onChange={e => props.onChange(e.target.value)}
        />
      ),
    },
  ];

  if (getPayCodes.state === "LOADING") {
    return <></>;
  }

  const payCodes = compact(getPayCodes?.data?.orgRef_PayCode?.all ?? []);
  const mappedData = payCodes.map(o => ({
    ...o,
    description: o.description?.toString(),
    externalId: o.externalId?.toString(),
    code: o.code?.toString(),
  }));
  const payCodesCount = payCodes.length;

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
          <PageTitle title={t("Pay Codes")} />
        </Grid>
        <Can do={[PermissionEnum.FinanceSettingsSave]}>
          <Grid item>
            <ImportDataButton
              orgId={params.organizationId}
              importType={DataImportType.PayCode}
              label={t("Import pay codes")}
            />
          </Grid>
        </Can>
      </Grid>
      <EditableTable
        title={`${payCodesCount} ${t("Pay Codes")}`}
        columns={columns}
        data={mappedData}
        onRowAdd={{
          action: async newData => {
            const newPayCode = {
              ...payCode,
              name: newData.name,
              externalId: newData.externalId,
              description: newData.description,
              code: newData.code,
            };
            const result = await create(newPayCode);
            if (!result) throw Error("Preserve Row on error");
            if (result) await getPayCodes.refetch();
          },
          permissions: [PermissionEnum.FinanceSettingsSave],
        }}
        onRowUpdate={{
          action: async newData => {
            const updatePayCode = {
              id: newData.id,
              rowVersion: newData.rowVersion,
              name: newData.name,
              externalId: newData.externalId,
              description: newData.description,
              code: newData.code,
            };
            const result = await update(updatePayCode);
            if (!result) throw Error("Preserve Row on error");
            if (result) await getPayCodes.refetch();
          },
          permissions: [PermissionEnum.FinanceSettingsSave],
        }}
        onRowDelete={{
          action: async oldData => {
            await deletePayCode(String(oldData.id));
            await getPayCodes.refetch();
          },
          permissions: [PermissionEnum.FinanceSettingsDelete],
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
