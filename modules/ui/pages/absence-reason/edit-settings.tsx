import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { AbsenceReasonTrackingTypeId } from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageHeader } from "ui/components/page-header";
import { PageTitle } from "ui/components/page-title";
import {
  AbsenceReasonEditSettingsRoute,
  AbsenceReasonViewEditRoute,
} from "ui/routes/absence-reason";
import { useRouteParams } from "ui/routes/definition";
import { AbsenceReasonSettings } from "./absence-reason-settings";
import { GetAbsenceReason } from "./graphql/get-absence-reason.gen";
import { UpdateAbsenceReason } from "./graphql/update-absence-reason.gen";
import { makeStyles } from "@material-ui/styles";

type Props = {};

export const AbsenceReasonEditSettingsPage: React.FC<Props> = props => {
  const params = useRouteParams(AbsenceReasonEditSettingsRoute);
  const history = useHistory();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const classes = useStyles();

  const result = useQueryBundle(GetAbsenceReason, {
    fetchPolicy: "cache-and-network",
    variables: {
      absenceReasonId: params.absenceReasonId,
    },
  });

  const [mutation] = useMutationBundle(UpdateAbsenceReason);

  const updateAbsenceReason = useCallback(
    async (updatedValues: {
      allowNegativeBalance: boolean;
      description?: string;
      absenceReasonTrackingTypeId?: AbsenceReasonTrackingTypeId;
    }) => {
      if (result.state !== "DONE") {
        return;
      }
      const reason = result.data.orgRef_AbsenceReason?.byId!;
      const {
        allowNegativeBalance,
        description,
        absenceReasonTrackingTypeId: absenceReasonTrackingId,
      } = updatedValues;
      await mutation({
        variables: {
          absenceReason: {
            id:reason.id,
            rowVersion: reason.rowVersion,
            allowNegativeBalance,
            isBucket: false,
            description,
            absenceReasonTrackingId,
          },
        },
      });
      history.push(AbsenceReasonViewEditRoute.generate(params));
    },
    [result, history, params]
  );

  if (result.state !== "DONE" && result.state !== "UPDATING") {
    return <></>;
  }
  const absenceReason = result.data.orgRef_AbsenceReason?.byId!;

  return (
    <>
      <PageTitle title={t("Absence Reason")} withoutHeading={!isMobile} />
      <PageHeader text={absenceReason.name} label={t("Name")} />

      <AbsenceReasonSettings
        description={absenceReason.description || undefined}
        allowNegativeBalance={absenceReason.allowNegativeBalance}
        absenceReasonTrackingTypeId={
          absenceReason.absenceReasonTrackingTypeId || undefined
        }
        onSubmit={updateAbsenceReason}
        onCancel={() => {
          history.push(AbsenceReasonViewEditRoute.generate(params));
        }}
        className={classes.content}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  content: {
    marginTop: theme.spacing(2),
  },
}));
