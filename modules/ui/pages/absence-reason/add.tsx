import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useMutationBundle } from "graphql/hooks";
import { AssignmentType } from "graphql/server-types.gen";
import * as React from "react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { Step, TabbedHeader } from "ui/components/tabbed-header";
import {
  AbsenceReasonAddRoute,
  AbsenceReasonRoute,
  AbsenceReasonViewEditRoute,
} from "ui/routes/absence-reason";
import { useRouteParams } from "ui/routes/definition";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { AbsenceReasonSettings } from "./absence-reason-settings";
import { AddBasicInfo } from "./add-basic-info";
import { CreateAbsenceReason } from "./graphql/create-absence-reason.gen";
import { GetAbsenceReasonsDocument } from "reference-data/get-absence-reasons.gen";

type Props = {};

export const AbsenceReasonAddPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const params = useRouteParams(AbsenceReasonAddRoute);
  const { openSnackbar } = useSnackbar();

  const absenceReasonsReferenceQuery = {
    query: GetAbsenceReasonsDocument,
    variables: { orgId: params.organizationId },
  };

  const namePlaceholder = t("Professional Development");
  const [basicInfo, setBasicInfo] = React.useState<{
    name: string;
    externalId?: string;
  } | null>(null);

  const [createAbsenceReason] = useMutationBundle(CreateAbsenceReason, {
    refetchQueries: [absenceReasonsReferenceQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const settingsOnSubmit = useCallback(
    async (updatedValues: {
      allowNegativeBalance: boolean;
      description?: string;
      code?: string;
      isRestricted: boolean;
      requireNotesToAdmin: boolean;
      requiresApproval: boolean;
    }) => {
      if (!basicInfo) {
        return;
      }
      const {
        allowNegativeBalance,
        description,
        code,
        isRestricted,
        requireNotesToAdmin,
        requiresApproval,
      } = updatedValues;

      const result = await createAbsenceReason({
        variables: {
          absenceReason: {
            orgId: params.organizationId,
            ...basicInfo,
            externalId: basicInfo?.externalId,
            allowNegativeBalance,
            isRestricted,
            appliesToAssignmentTypes: AssignmentType.ContractAssignment,
            description,
            code,
            requireNotesToAdmin: requireNotesToAdmin,
            requiresApproval,
          },
        },
      });
      const id = result.data?.orgRef_AbsenceReason?.create?.id;
      if (id) {
        history.push(
          AbsenceReasonViewEditRoute.generate({
            ...params,
            absenceReasonId: id,
          })
        );
      }
    },
    [createAbsenceReason, basicInfo, params, history]
  );

  const steps: Array<Step> = [
    {
      stepNumber: 0,
      name: t("Basic Info"),
      content: (setStep: React.Dispatch<React.SetStateAction<number>>) => {
        return (
          <AddBasicInfo
            namePlaceholder={namePlaceholder}
            name={basicInfo?.name ?? ""}
            externalId={basicInfo?.externalId}
            onNameChange={name => {
              setBasicInfo({
                name,
              });
            }}
            onSubmit={(name, externalId) => {
              setBasicInfo({
                name,
                externalId,
              });
              setStep(steps[1].stepNumber);
            }}
            onCancel={() => {
              history.push(AbsenceReasonRoute.generate(params));
            }}
          />
        );
      },
    },
    {
      stepNumber: 1,
      name: t("Settings"),
      content: () => {
        return (
          <AbsenceReasonSettings
            allowNegativeBalance={false}
            requireNotesToAdmin={false}
            requiresApproval={false}
            description={""}
            code={""}
            isRestricted={false}
            onSubmit={settingsOnSubmit}
            onCancel={() => {
              history.push(AbsenceReasonRoute.generate(params));
            }}
            orgId={params.organizationId}
          />
        );
      },
    },
  ];

  return (
    <>
      <div className={classes.header}>
        <PageTitle title={t("Create new absence reason")} />
        <Typography variant="h1">
          {basicInfo?.name || (
            <span className={classes.placeholder}>{namePlaceholder}</span>
          )}
        </Typography>
      </div>
      <TabbedHeader steps={steps} isWizard={true} showStepNumber={true} />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  placeholder: {
    opacity: "0.2",
    filter: "alpha(opacity = 20)",
  },
}));
