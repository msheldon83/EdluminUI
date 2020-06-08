import { makeStyles, Grid } from "@material-ui/core";
import { useIsMobile } from "hooks";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { ContractsRoute } from "ui/routes/contracts";
import { useRouteParams } from "ui/routes/definition";
import { GetAllContractsInOrg } from "./graphql/get-contracts.gen";
import { UpdateContract } from "./graphql/update-contract.gen";
import { CreateContract } from "./graphql/create-contract.gen";
import { DeleteContract } from "./graphql/delete-contract.gen";
import { compact } from "lodash-es";
import { Column } from "material-table";
import { EditableTable } from "ui/components/editable-table";
import {
  ContractCreateInput,
  ContractUpdateInput,
  PermissionEnum,
  DataImportType,
} from "graphql/server-types.gen";
import * as Yup from "yup";
import { useSnackbar } from "hooks/use-snackbar";
import { useWorkDayPatterns } from "reference-data/work-day-patterns";
import { ShowErrors, ShowGenericErrors } from "ui/components/error-helpers";
import { GetAllContractsDocument } from "reference-data/get-contracts.gen";
import { ImportDataButton } from "ui/components/data-import/import-data-button";
import { Can } from "ui/components/auth/can";
import { ContractScheduleWarning } from "ui/components/contract-schedule/contract-schedule-warning";

type Props = {};

export const Contracts: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(ContractsRoute);
  const { openSnackbar } = useSnackbar();

  const contractsReferenceDataQuery = {
    query: GetAllContractsDocument,
    variables: { orgId: params.organizationId },
  };

  const workDayPatterns = useWorkDayPatterns(params.organizationId);
  const workDayPatternOptions = useMemo(
    () =>
      workDayPatterns.reduce(
        (o: any, key: any) => ({ ...o, [key.id]: key.name }),
        {}
      ),
    [workDayPatterns]
  );

  //Hardcoding includeExpired.  Currently UI does not give option to choose.
  const getContracts = useQueryBundle(GetAllContractsInOrg, {
    variables: { orgId: params.organizationId, includeExpired: true },
  });

  const [updateContract] = useMutationBundle(UpdateContract, {
    refetchQueries: [
      contractsReferenceDataQuery,
      "GetContractsWithoutSchedules",
    ],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [createContract] = useMutationBundle(CreateContract, {
    refetchQueries: [
      contractsReferenceDataQuery,
      "GetContractsWithoutSchedules",
    ],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [deleteContractMutation] = useMutationBundle(DeleteContract, {
    refetchQueries: [
      contractsReferenceDataQuery,
      "GetContractsWithoutSchedules",
    ],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const contract: ContractCreateInput = useMemo(
    () => ({
      orgId: params.organizationId,
      name: "",
      externalId: null,
      numberOfDays: null,
      workDayPatternId: workDayPatterns[0]?.id,
    }),
    [params.organizationId, workDayPatterns]
  );

  const columns: Column<GetAllContractsInOrg.All>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
      editable: "always",
    },
    {
      title: t("ExternalId"),
      field: "externalId",
      searchable: true,
      hidden: isMobile,
      editable: "always",
    },
    {
      title: t("Number of days"),
      field: "numberOfDays",
      searchable: true,
      hidden: isMobile,
      editable: "always",
    },
    {
      title: t("Pattern"),
      field: "workDayPatternId",
      searchable: true,
      hidden: isMobile,
      editable: "always",
      lookup: workDayPatternOptions,
    },
  ];

  const validateContract = React.useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string()
          .nullable()
          .required(t("Name is required")),
        externalId: Yup.string().nullable(),
        numberOfDays: Yup.number().nullable(),
        workDayPatternId: Yup.string()
          .nullable()
          .required(t("A pattern is required")),
      }),
    [t]
  );

  if (getContracts.state === "LOADING") {
    return <></>;
  }

  const contracts = compact(getContracts?.data?.contract?.all ?? []);

  const formattedContracts = contracts.map(o => ({
    ...o,
    externalId: o.externalId?.toString(),
    numberOfDays: o.numberOfDays ? o.numberOfDays : undefined,
  }));

  const contractsCount = contracts.length;

  const editContract = async (contract: ContractUpdateInput) => {
    validateContract.validate(contract).catch(function(err) {
      ShowGenericErrors(err, openSnackbar);
    });
    const result = await updateContract({
      variables: {
        contract: {
          id: contract.id,
          rowVersion: contract.rowVersion,
          name: contract.name,
          externalId:
            contract.externalId && contract.externalId.trim().length === 0
              ? null
              : contract.externalId,
          numberOfDays: contract.numberOfDays,
          workDayPatternId: contract.workDayPatternId,
        },
      },
    });
    if (!result.data) return false;
    return true;
  };

  const addContract = async (contract: ContractCreateInput) => {
    validateContract.validate(contract).catch(function(err) {
      ShowGenericErrors(err, openSnackbar);
    });
    const result = await createContract({
      variables: {
        contract: {
          ...contract,
          name: contract.name,
          externalId:
            contract.externalId && contract.externalId.trim().length === 0
              ? null
              : contract.externalId,
          numberOfDays: contract.numberOfDays,
          workDayPatternId: contract.workDayPatternId,
        },
      },
    });
    if (!result.data) return false;
    return true;
  };

  const deleteContract = (contractId: string) => {
    return deleteContractMutation({
      variables: {
        contractId: contractId,
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
          <PageTitle title={t("Contracts")} />
        </Grid>
        <Can do={[PermissionEnum.FinanceSettingsSave]}>
          <Grid item>
            <ImportDataButton
              orgId={params.organizationId}
              importType={DataImportType.Contract}
              label={t("Import contracts")}
            />
          </Grid>
        </Can>
      </Grid>

      <ContractScheduleWarning orgId={params.organizationId} />

      <EditableTable
        title={`${contractsCount} ${t("Contracts")}`}
        columns={columns}
        data={formattedContracts}
        onRowAdd={{
          action: async newData => {
            const newContract = {
              ...contract,
              name: newData.name,
              externalId: newData.externalId,
              numberOfDays: newData.numberOfDays,
              workDayPatternId: newData.workDayPatternId,
            };
            const result = await addContract(newContract);
            if (!result) throw Error("Preserve Row on error");
            if (result) await getContracts.refetch();
          },
          permissions: [PermissionEnum.FinanceSettingsSave],
        }}
        onRowUpdate={{
          action: async newData => {
            const updateContract = {
              id: newData.id,
              rowVersion: newData.rowVersion,
              name: newData.name,
              externalId: newData.externalId,
              numberOfDays: newData.numberOfDays,
              workDayPatternId: newData.workDayPatternId,
            };
            const result = await editContract(updateContract);
            if (!result) throw Error("Preserve Row on error");
            if (result) await getContracts.refetch();
          },
          permissions: [PermissionEnum.FinanceSettingsSave],
        }}
        onRowDelete={{
          action: async oldData => {
            await deleteContract(String(oldData.id));
            await getContracts.refetch();
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
