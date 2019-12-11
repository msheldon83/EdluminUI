import { useIsMobile } from "hooks";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { Section } from "ui/components/section";
import { useState } from "react";
import Maybe from "graphql/tsutils/Maybe";
import { useTranslation } from "react-i18next";
import { Redirect, useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { PageHeader } from "ui/components/page-header";
import { PayCodeRoute, PayCodeViewEditRoute } from "ui/routes/pay-code";
import { GetPayCodeById } from "ui/pages/pay-code/graphql/get-pay-code.gen";
import { useRouteParams } from "ui/routes/definition";
import { SectionHeader } from "ui/components/section-header";
import { Grid, Typography } from "@material-ui/core";
import * as yup from "yup";
import { DeletePayCode } from "./graphql/delete-pay-code.gen";
import { UpdatePayCode } from "./graphql/update-pay-code.gen";
import { PayCodeDescription } from "./components/description";

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
};

type Props = {
  onSubmit: (name: string, externalId?: string | null | undefined) => void;
  onCancel: () => void;
};

export const PayCodeViewEditPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const isMobile = useIsMobile();
  const params = useRouteParams(PayCodeViewEditRoute);
  const [editing, setEditing] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);

  const [deletePayCodeMutation] = useMutationBundle(DeletePayCode);
  const deletePayCode = React.useCallback(() => {
    history.push(PayCodeRoute.generate(params));
    return deletePayCodeMutation({
      variables: {
        payCodeId: Number(params.payCodeId),
      },
    });
  }, [deletePayCodeMutation, history, params]);

  const [updatePayCode] = useMutationBundle(UpdatePayCode);
  const enableDisablePayCode = React.useCallback(
    (enabled: boolean, rowVersion: string) => {
      return updatePayCode({
        variables: {
          payCode: {
            id: Number(params.payCodeId),
            rowVersion: rowVersion,
            expired: !enabled,
          },
        },
      });
    },
    [updatePayCode, params]
  );

  const getPayCode = useQueryBundle(GetPayCodeById, {
    variables: { id: params.payCodeId },
  });

  if (getPayCode.state === "LOADING") {
    return <></>;
  }

  const payCode = getPayCode?.data?.orgRef_PayCode?.byId;
  if (!payCode) {
    // Redirect the User back to the List page
    const listUrl = PayCodeRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  if (enabled === null) {
    setEnabled(!payCode.expired);
  }

  const updateName = async (name: string) => {
    await updatePayCode({
      variables: {
        payCode: {
          id: Number(payCode.id),
          rowVersion: payCode.rowVersion,
          name,
        },
      },
    });
  };

  const updateExternalId = async (externalId?: string | null) => {
    await updatePayCode({
      variables: {
        payCode: {
          id: Number(payCode.id),
          rowVersion: payCode.rowVersion,
          externalId,
        },
      },
    });
  };

  const updateDescription = async (description?: string | null) => {
    await updatePayCode({
      variables: {
        payCode: {
          id: Number(payCode.id),
          rowVersion: payCode.rowVersion,
          description,
        },
      },
    });
    const viewParams = {
      ...params,
    };
    history.push(PayCodeRoute.generate(viewParams));
  };

  const cancelUrl = () => {
    const url = PayCodeRoute.generate(params);
    history.push(url);
  };

  return (
    <>
      <PageTitle title={t("Pay Code")} withoutHeading={!isMobile} />
      <PageHeader
        text={payCode.name}
        label={t("Name")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.name)}
        validationSchema={yup.object().shape({
          value: yup.string().required(t("Name is required")),
        })}
        onSubmit={async (value: Maybe<string>) => {
          await updateName(value!);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
        actions={[
          {
            name: t("Change History"),
            onClick: () => {},
          },
          {
            name: enabled ? t("Inactivate") : t("Activate"),
            onClick: async () => {
              await enableDisablePayCode(!enabled, payCode.rowVersion);
              setEnabled(!enabled);
            },
          },
          {
            name: t("Delete"),
            onClick: deletePayCode,
          },
        ]}
        isInactive={!enabled}
        inactiveDisplayText={t("This pay code is currently inactive.")}
        onActivate={async () => {
          await enableDisablePayCode(true, payCode.rowVersion);
          setEnabled(true);
        }}
      />
      <PageHeader
        text={payCode.externalId}
        label={t("External ID")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.externalId)}
        validationSchema={yup.object().shape({
          value: yup.string().nullable(),
        })}
        onSubmit={async (value: Maybe<string>) => {
          await updateExternalId(value);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
        isSubHeader={true}
        showLabel={true}
      />
      <Section>
        <SectionHeader title={t("Settings")} />
        <Grid container spacing={2}>
          <PayCodeDescription
            description={payCode.description}
            onSubmit={updateDescription}
            onCancel={cancelUrl}
          />
        </Grid>
      </Section>
    </>
  );
};
