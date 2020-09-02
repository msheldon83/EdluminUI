import {
  makeStyles,
  Grid,
  FormControlLabel,
  Checkbox,
  Typography,
  Tooltip,
  TextField,
} from "@material-ui/core";
import { useIsMobile } from "hooks";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { AccountingCodeRoute } from "ui/routes/accounting-code";
import { useRouteParams } from "ui/routes/definition";
import { GetAllAccountingCodesWithinOrg } from "ui/pages/accounting-code/graphql/accounting-codes.gen";
import { UpdateAccountingCode } from "./graphql/update-accounting-code.gen";
import { CreateAccountingCode } from "./graphql/create-accounting-code.gen";
import { DeleteAccountingCode } from "./graphql/delete-accounting-code.gen";
import { compact } from "lodash-es";
import { CsvExporter } from "ui/components/csv-exporter";
import { Column } from "material-table";
import { EditableTable } from "ui/components/editable-table";
import {
  AccountingCodeCreateInput,
  AccountingCodeUpdateInput,
  PermissionEnum,
  DataImportType,
} from "graphql/server-types.gen";
import * as Yup from "yup";
import { useSnackbar } from "hooks/use-snackbar";
import { useLocations, useLocationOptions } from "reference-data/locations";
import { ShowErrors, ShowGenericErrors } from "ui/components/error-helpers";
import { GetAccountingCodesDocument } from "reference-data/get-accounting-codes.gen";
import { ImportDataButton } from "ui/components/data-import/import-data-button";
import { Can } from "ui/components/auth/can";
import { Select, OptionType } from "ui/components/form/select";

export const AccountingCode: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(AccountingCodeRoute);
  const { openSnackbar } = useSnackbar();

  const accountingCodesReferenceDataQuery = {
    query: GetAccountingCodesDocument,
    variables: { orgId: params.organizationId },
  };

  const locations = useLocations(params.organizationId);
  const locationOptions = useLocationOptions(params.organizationId);

  //Hardcoding includeExpired.  Currently UI does not give option to choose.
  const getAccountingCodes = useQueryBundle(GetAllAccountingCodesWithinOrg, {
    variables: { orgId: params.organizationId, includeExpired: true },
  });

  const [updateAccountingCode] = useMutationBundle(UpdateAccountingCode, {
    refetchQueries: [accountingCodesReferenceDataQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [createAccountingCode] = useMutationBundle(CreateAccountingCode, {
    refetchQueries: [accountingCodesReferenceDataQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [deleteAccountingCodeMutation] = useMutationBundle(
    DeleteAccountingCode,
    {
      refetchQueries: [accountingCodesReferenceDataQuery],
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const accountingCode: AccountingCodeCreateInput = {
    orgId: params.organizationId,
    name: "",
    externalId: null,
    locationIds: [],
  };

  const columns: Column<GetAllAccountingCodesWithinOrg.All>[] = [
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
      title: t("Code"),
      field: "externalId",
      searchable: true,
      hidden: isMobile,
      editable: "always",
    },
    {
      title: t("School"),
      field: "locationIds",
      searchable: true,
      hidden: isMobile,
      editable: "always",
      render: data => {
        if (data.allLocations) {
          return <Typography>{t("All Schools")}</Typography>;
        } else if (data.locations.length === 1) {
          return <Typography>{data.locations[0].name}</Typography>;
        } else {
          return (
            <Tooltip
              className={classes.toolTip}
              placement="bottom-start"
              title={data.locations.map(l => l.name).join(", ")}
            >
              <Typography>{`${data.locations.length} ${t(
                "Schools"
              )}`}</Typography>
            </Tooltip>
          );
        }
      },
      editComponent: (props: any) => {
        const locationIds: string[] = props.rowData.locationIds as string[];
        const allSchoolsChecked =
          props.rowData.allLocations != null
            ? (props.rowData.allLocations as boolean)
            : true;
        return (
          <>
            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={allSchoolsChecked}
                    value={allSchoolsChecked}
                    onChange={e => {
                      props.onRowDataChange({
                        ...props.rowData,
                        allLocations: e.target.checked,
                      });
                    }}
                  />
                }
                label={t("All Schools")}
              />
            </div>
            {!allSchoolsChecked && (
              <div>
                <Select
                  value={
                    locationOptions.filter(
                      e =>
                        e.value &&
                        locationIds &&
                        locationIds.includes(e.value.toString())
                    ) ?? { label: "", value: "" }
                  }
                  className={classes.schoolSelector}
                  multiple={true}
                  withResetValue={false}
                  options={locationOptions}
                  fixedListBox={true}
                  onChange={e => {
                    const ids = e.map((v: OptionType) => v.value.toString());

                    props.onRowDataChange({
                      ...props.rowData,
                      locationIds: ids,
                    });
                  }}
                />
              </div>
            )}
          </>
        );
      },
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
      o.location === null ? { id: "0", name: t("All Schools") } : o.location,
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
          locationIds: accountingCode.locationIds,
          allLocations: accountingCode.allLocations,
        },
      },
    });
    if (!result.data) return false;
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
          locationIds: accountingCode.locationIds,
          allLocations: accountingCode.allLocations,
        },
      },
    });
    if (!result.data) return false;
    return true;
  };

  const deleteAccountingCode = (accountingCodeId: string) => {
    return deleteAccountingCodeMutation({
      variables: {
        accountingCodeId: accountingCodeId,
      },
    });
  };

  const title = `${accountingCodesCount} ${t("Accounting Codes")}`;

  const exportData = formattedAccountingCodes.map(e => {
    return {
      Name: e.name,
      Code: e.externalId ?? "",
      School:
        e.locations.length === 0
          ? "All Schools"
          : e.locations.map(c => c.name).join(";"),
    };
  });

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
        <Can do={[PermissionEnum.FinanceSettingsSave]}>
          <Grid item>
            <ImportDataButton
              orgId={params.organizationId}
              importType={DataImportType.AccountingCode}
              label={t("Import accounting codes")}
              className={classes.marginRight}
            />

            <CsvExporter data={exportData} fileName={title} />
          </Grid>
        </Can>
      </Grid>

      <EditableTable
        title={title}
        columns={columns}
        data={formattedAccountingCodes}
        onRowAdd={{
          action: async newData => {
            const newAccountingCode = {
              ...accountingCode,
              name: newData.name,
              externalId: newData.externalId,
              locationIds: newData.locationIds ?? [],
              allLocations: !newData.locationIds ? true : newData.allLocations,
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
              locationIds: newData.locationIds,
              allLocations: newData.allLocations,
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
  schoolSelector: {
    zIndex: 1000,
    maxWidth: theme.typography.pxToRem(500),
  },
  toolTip: {
    cursor: "pointer",
  },
  marginRight: {
    marginRight: "10px",
  },
}));
