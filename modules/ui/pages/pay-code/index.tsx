import { Grid, makeStyles } from "@material-ui/core";
import { useTheme } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { compact } from "lodash-es";
import { EditableTable } from "ui/components/editable-table";
import { PageTitle } from "ui/components/page-title";
import {
  PayCode as PayCodeGQL,
  PayCodeCreateInput,
  PayCodeUpdateInput,
} from "graphql/server-types.gen";
import { Column } from "material-table";
import { CreatePayCode } from "./graphql/create.gen";
import { PayCodeViewEditRoute } from "ui/routes/pay-code";
import { useRouteParams } from "ui/routes/definition";
import { GetAllPayCodesWithinOrg } from "ui/pages/pay-code/graphql/get-pay-codes.gen";
import { UpdatePayCode } from "./graphql/update-pay-code.gen";
import { DeletePayCode } from "./graphql/delete-pay-code.gen";

type Props = {};

export const PayCode: React.FC<Props> = props => {
  const { t } = useTranslation();
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const [createPayCode] = useMutationBundle(CreatePayCode);
  const [updatePayCode] = useMutationBundle(UpdatePayCode);
  const params = useRouteParams(PayCodeViewEditRoute);
  const [includeExpired, setIncludeExpired] = React.useState(false);

  const getPayCodes = useQueryBundle(GetAllPayCodesWithinOrg, {
    variables: { orgId: params.organizationId, includeExpired },
  });
  const [deletePayCodeMutation] = useMutationBundle(DeletePayCode);
  const deletePayCode = (payCodeId: string) => {
    return deletePayCodeMutation({
      variables: {
        payCodeId: Number(payCodeId),
      },
    });
  };

  const [payCode] = React.useState<PayCodeCreateInput>({
    orgId: Number(params.organizationId),
    name: "",
    externalId: null,
    description: "",
  });

  const create = async (payCode: PayCodeCreateInput) => {
    const result = await createPayCode({
      variables: {
        payCode: {
          ...payCode,
          externalId:
            payCode.externalId && payCode.externalId.trim().length === 0
              ? null
              : payCode.externalId,
          description:
            payCode.description && payCode.description.trim().length === 0
              ? null
              : payCode.description,
        },
      },
    });
    return result?.data?.orgRef_PayCode?.create?.id;
  };

  const update = async (payCode: PayCodeUpdateInput) => {
    const result = await updatePayCode({
      variables: {
        payCode: {
          id: Number(payCode.id),
          rowVersion: payCode.rowVersion,
          externalId:
            payCode.externalId && payCode.externalId.trim().length === 0
              ? null
              : payCode.externalId,
          description:
            payCode.description && payCode.description.trim().length === 0
              ? null
              : payCode.description,
        },
      },
    });
    return result?.data?.orgRef_PayCode?.update?.id;
  };

  const columns: Column<GetAllPayCodesWithinOrg.All>[] = [
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

  if (getPayCodes.state === "LOADING") {
    return <></>;
  }

  const payCodes = compact(getPayCodes?.data?.orgRef_PayCode?.all ?? []);
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
      </Grid>
      <EditableTable
        title={`${payCodesCount} ${t("Pay Codes")}`}
        columns={columns}
        data={payCodes}
        defaultObject={
          { name: "", externalId: null, description: null } as PayCodeGQL
        }
        onRowAdd={async newData => {
          const newPayCode = {
            ...payCode,
            name: newData.name,
            externalId: newData.externalId,
            description: newData.description,
          };
          await create(newPayCode);
          getPayCodes.refetch();
        }}
        onRowUpdate={async newData => {
          const updatePayCode = {
            id: Number(newData.id),
            rowVersion: newData.rowVersion,
            name: newData.name,
            externalId: newData.externalId,
            description: newData.description,
          };
          await update(updatePayCode);
        }}
        onRowDelete={async oldData => {
          await deletePayCode(String(oldData.id));
          getPayCodes.refetch();
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
