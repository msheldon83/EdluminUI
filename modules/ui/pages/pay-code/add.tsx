import { makeStyles, useTheme } from "@material-ui/styles";
import { useMutationBundle } from "graphql/hooks";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { Grid, Typography } from "@material-ui/core";
import {
  PayCodeRoute,
  PayCodeAddRoute,
  PayCodeViewRoute,
} from "ui/routes/Pay-code";
import { PayCodeCreateInput } from "graphql/server-types.gen";
import { useRouteParams } from "ui/routes/definition";
import { CreatePayCode } from "./graphql/create.gen";
import { AddInfo } from "./components/add-info";

export const PayCodeAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PayCodeAddRoute);
  const classes = useStyles();
  const [createPayCode] = useMutationBundle(CreatePayCode);
  const [name, setName] = React.useState<string | null>(null);
  const namePlaceholder = t("Name");

  const [payCode, setPayCode] = React.useState<PayCodeCreateInput>({
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
        },
      },
    });
    return result?.data?.orgRef_PayCode?.create?.id;
  };

  return (
    <>
      <div className={classes.header}>
        <PageTitle title={t("Create pay code")} />
        <Typography variant="h1">
          {name || (
            <span className={classes.placeholder}>{namePlaceholder}</span>
          )}
        </Typography>
      </div>

      <AddInfo
        payCode={payCode}
        onSubmit={async (
          name: string,
          externalId?: string | undefined | null,
          description: string | undefined | null
        ) => {
          const newPayCode = {
            ...payCode,
            name: name,
            externalId: externalId,
            description: description,
          };
          setPayCode(newPayCode);
          // Create the Position Type
          const id = await create(newPayCode);
          const viewParams = {
            ...params,
            payCodeId: id!,
          };
          // Go to the Position Type View page
          history.push(PayCodeViewRoute.generate(viewParams));
        }}
        onCancel={() => {
          const url = PayCodeRoute.generate(params);
          history.push(url);
        }}
        onNameChange={name => setName(name)}
        namePlaceholder={namePlaceholder}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  placeholder: {
    opacity: "0.2",
    filter: "alpha(opacity = 20)",
  },
}));
