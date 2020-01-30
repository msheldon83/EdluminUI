import { makeStyles, Grid, useTheme } from "@material-ui/core";
import { useIsMobile } from "hooks";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { AccountingCodeRoute } from "ui/routes/accounting-code";
import { useRouteParams } from "ui/routes/definition";
import { GetAllAccountingCodesWithinOrg } from "ui/pages/accounting-code/graphql/accounting-codes.gen";
import { UpdateAccountingCode } from "./graphql/update-accounting-code.gen";
import { CreateAccountingCode } from "./graphql/create-accounting-code.gen";
import { DeleteAccountingCode } from "./graphql/delete-accounting-code.gen";
import { compact } from "lodash-es";
import { Column } from "material-table";
import { EditableTable } from "ui/components/editable-table";
import {
  AccountingCodeCreateInput,
  AccountingCodeUpdateInput,
  PermissionEnum,
} from "graphql/server-types.gen";
import * as Yup from "yup";
import { useSnackbar } from "hooks/use-snackbar";
import { useLocations } from "reference-data/locations";
import { ShowErrors, ShowGenericErrors } from "ui/components/error-helpers";

type Props = {};

export const AccountingCode: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(AccountingCodeRoute);
  const { openSnackbar } = useSnackbar();

  const locations = useLocations(params.organizationId);
  const locationOptions = locations.reduce(
    (o: any, key: any) => ({ ...o, [key.id]: key.name }),
    {}
  );
  locationOptions[0] = "All Schools"; //add default option

  //Hardcoding includeExpired.  Currently UI does not give option to choose.
  const getAccountingCodes = useQueryBundle(GetAllAccountingCodesWithinOrg, {
    variables: { orgId: params.organizationId, includeExpired: true },
  });

  const [updateAccountingCode] = useMutationBundle(UpdateAccountingCode, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [createAccountingCode] = useMutationBundle(CreateAccountingCode, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [deleteAccountingCodeMutation] = useMutationBundle(
    DeleteAccountingCode,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const accountingCode: AccountingCodeCreateInput = {
    orgId: params.organizationId,
    name: "",
    externalId: null,
    locationId: null,
  };

  const columns: Column<GetAllAccountingCodesWithinOrg.All>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
      editable: "always",
    },
    {
      title: t("Code"),
      field: "externalId",
      searchable: true,
      hidden: isMobile,
      editable: "always",
    },
    {
      title: t("School"),
      field: "location.id",
      searchable: true,
      hidden: isMobile,
      editable: "always",
      lookup: locationOptions,
    },
  ];

  const validateAccountingCode = React.useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .nullable()
          .required(t("Name is required")),
        externalId: Yup.string().nullable(),
        locationId: Yup.string().nullable(),
      }),
    [t]
  );

  if (getAccountingCodes.state === "LOADING") {
    return <></>;
  }

  const accountingCodes = compact(
    getAccountingCodes?.data?.orgRef_AccountingCode?.all ?? []
  );

  const formattedAccountingCodes = accountingCodes.map(o => ({
    ...o,
    location:
      o.location === null ? { id: "0", name: "All Schools" } : o.location,
    externalId: o.externalId?.toString(),
  }));

  const accountingCodesCount = accountingCodes.length;

  const editAccountingCode = async (
    accountingCode: AccountingCodeUpdateInput
  ) => {
    validateAccountingCode.validate(accountingCode).catch(function(err) {
      ShowGenericErrors(err, openSnackbar);
    });
    const result = await updateAccountingCode({
      variables: {
        accountingCode: {
          id: accountingCode.id,
          rowVersion: accountingCode.rowVersion,
          name: accountingCode.name,
          externalId:
            accountingCode.externalId &&
            accountingCode.externalId.trim().length === 0
              ? null
              : accountingCode.externalId,
          locationId:
            accountingCode.locationId &&
            accountingCode.locationId.toString().length === 0
              ? null
              : accountingCode.locationId,
        },
      },
    });
    if (result === undefined) return false;
    return true;
  };

  const addAccountingCode = async (
    accountingCode: AccountingCodeCreateInput
  ) => {
    validateAccountingCode.validate(accountingCode).catch(function(err) {
      ShowGenericErrors(err, openSnackbar);
    });
    const result = await createAccountingCode({
      variables: {
        accountingCode: {
          ...accountingCode,
          name: accountingCode.name,
          externalId:
            accountingCode.externalId &&
            accountingCode.externalId.trim().length === 0
              ? null
              : accountingCode.externalId,
          locationId:
            accountingCode.locationId &&
            accountingCode.locationId.toString().length === 0
              ? null
              : accountingCode.locationId,
        },
      },
    });
    if (result === undefined) return false;
    return true;
  };

  const deleteAccountingCode = (accountingCodeId: string) => {
    return deleteAccountingCodeMutation({
      variables: {
        accountingCodeId: accountingCodeId,
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
          <PageTitle title={t("Accounting Codes")} />
        </Grid>
      </Grid>

      <EditableTable
        title={`${accountingCodesCount} ${t("Accounting Codes")}`}
        columns={columns}
        data={formattedAccountingCodes}
        onRowAdd={{
          action: async newData => {
            const newAccountingCode = {
              ...accountingCode,
              name: newData.name,
              externalId: newData.externalId,
              locationId:
                newData.location === null ? undefined : newData.location?.id,
            };
            const result = await addAccountingCode(newAccountingCode);
            if (!result) throw Error("Preserve Row on error");
            if (result) await getAccountingCodes.refetch();
          },
          permissions: [PermissionEnum.FinanceSettingsSave],
        }}
        onRowUpdate={{
          action: async newData => {
            const updateAccountingCode = {
              id: newData.id,
              rowVersion: newData.rowVersion,
              name: newData.name,
              externalId: newData.externalId,
              locationId:
                newData.location === null ? undefined : newData.location?.id,
            };
            const result = await editAccountingCode(updateAccountingCode);
            if (!result) throw Error("Preserve Row on error");
            if (result) await getAccountingCodes.refetch();
          },
          permissions: [PermissionEnum.FinanceSettingsSave],
        }}
        onRowDelete={{
          action: async oldData => {
            await deleteAccountingCode(String(oldData.id));
            await getAccountingCodes.refetch();
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
