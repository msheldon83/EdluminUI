import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { AbsenceReasonTrackingTypeId } from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageHeader } from "ui/components/page-header";
import { PageTitle } from "ui/components/page-title";
import {
  AbsenceReasonEditSettingsRoute,
  AbsenceReasonViewEditRoute,
} from "ui/routes/absence-reason";
import { useRouteParams } from "ui/routes/definition";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { AbsenceReasonSettings } from "./absence-reason-settings";
import { GetAbsenceReason } from "./graphql/get-absence-reason.gen";
import { UpdateAbsenceReason } from "./graphql/update-absence-reason.gen";
import { makeStyles } from "@material-ui/styles";
import { GetAbsenceReasonsDocument } from "reference-data/get-absence-reasons.gen";

type Props = {};

export const AbsenceReasonEditSettingsPage: React.FC<Props> = () => {
  const params = useRouteParams(AbsenceReasonEditSettingsRoute);
  const history = useHistory();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const absenceReasonsReferenceQuery = {
    query: GetAbsenceReasonsDocument,
    variables: { orgId: params.organizationId },
  };

  const getAbsenceReason = useQueryBundle(GetAbsenceReason, {
    fetchPolicy: "cache-and-network",
    variables: {
      absenceReasonId: params.absenceReasonId,
    },
  });

  const [mutation] = useMutationBundle(UpdateAbsenceReason, {
    refetchQueries: [absenceReasonsReferenceQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const updateAbsenceReason = async (updatedValues: {
    allowNegativeBalance: boolean;
    description?: string;
    code?: string;
    isRestricted: boolean;
    requireNotesToAdmin: boolean;
    absenceReasonCategoryId?: string;
    requiresApproval: boolean;
  }) => {
    if (getAbsenceReason.state !== "DONE") {
      return;
    }
    const reason = getAbsenceReason.data.orgRef_AbsenceReason!.byId!;
    const {
      allowNegativeBalance,
      description,
      code,
      isRestricted,
      requireNotesToAdmin,
      absenceReasonCategoryId,
      requiresApproval,
    } = updatedValues;

    const result = await mutation({
      variables: {
        absenceReason: {
          id: reason.id,
          rowVersion: reason.rowVersion,
          allowNegativeBalance,
          description,
          code,
          isRestricted,
          requireNotesToAdmin,
          absenceReasonCategoryId: absenceReasonCategoryId
            ? absenceReasonCategoryId
            : null,
          requiresApproval,
        },
      },
    });
    if (result.data) {
      history.push(AbsenceReasonViewEditRoute.generate(params));
    }
  };

  if (
    getAbsenceReason.state !== "DONE" &&
    getAbsenceReason.state !== "UPDATING"
  ) {
    return <></>;
  }
  const absenceReason = getAbsenceReason.data.orgRef_AbsenceReason!.byId!;

  return (
    <>
      <PageTitle title={t("Absence Reason")} withoutHeading={!isMobile} />
      <PageHeader text={absenceReason.name} label={t("Name")} />

      <AbsenceReasonSettings
        description={absenceReason.description || undefined}
        code={absenceReason.code || undefined}
        allowNegativeBalance={absenceReason.allowNegativeBalance}
        isRestricted={absenceReason.isRestricted}
        requireNotesToAdmin={absenceReason.requireNotesToAdmin ?? false}
        requiresApproval={absenceReason.requiresApproval ?? false}
        absenceReasonCategoryId={
          absenceReason.absenceReasonCategoryId || undefined
        }
        onSubmit={updateAbsenceReason}
        onCancel={() => {
          history.push(AbsenceReasonViewEditRoute.generate(params));
        }}
        className={classes.content}
        orgId={params.organizationId}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  content: {
    marginTop: theme.spacing(2),
  },
}));
