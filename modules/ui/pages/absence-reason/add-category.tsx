import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useMutationBundle } from "graphql/hooks";
import { AbsenceReasonTrackingTypeId } from "graphql/server-types.gen";
import * as React from "react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { Step, TabbedHeader } from "ui/components/tabbed-header";
import {
  AbsenceReasonAddRoute,
  AbsenceReasonRoute,
  AbsenceReasonCategoryViewEditRoute,
} from "ui/routes/absence-reason";
import { useRouteParams } from "ui/routes/definition";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { AddBasicInfo } from "./add-basic-info";
import { GetAbsenceReasonsDocument } from "reference-data/get-absence-reasons.gen";
import { GetAbsenceReasonCategoryDocument } from "./graphql/get-absence-reason-category.gen";
import { CreateAbsenceReasonCategory } from "./graphql/create-absence-reason-category.gen";
import { AbsenceReasonCategorySettings } from "./absence-reason-categories-settings";

type Props = {};

export const AbsenceReasonCategoryAddPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const params = useRouteParams(AbsenceReasonAddRoute);
  const { openSnackbar } = useSnackbar();

  const absenceReasonsReferenceQuery = {
    query: GetAbsenceReasonsDocument,
    variables: { orgId: params.organizationId },
  };
  const absenceReasonCategoriesReferenceQuery = {
    query: GetAbsenceReasonCategoryDocument,
    variables: { orgId: params.organizationId },
  };

  const namePlaceholder = " ";
  const [basicInfo, setBasicInfo] = React.useState<{
    name: string;
    externalId?: string;
  } | null>(null);

  const [createAbsenceReasonCategory] = useMutationBundle(
    CreateAbsenceReasonCategory,
    {
      refetchQueries: [
        absenceReasonsReferenceQuery,
        absenceReasonCategoriesReferenceQuery,
      ],
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const settingsOnSubmit = useCallback(
    async (updatedValues: {
      allowNegativeBalance: boolean;
      description?: string;
      absenceReasonTrackingTypeId?: AbsenceReasonTrackingTypeId;
    }) => {
      if (!basicInfo) {
        return;
      }
      const {
        allowNegativeBalance,
        absenceReasonTrackingTypeId: absenceReasonTrackingId,
        description,
      } = updatedValues;

      const result = await createAbsenceReasonCategory({
        variables: {
          absenceReasonCategory: {
            orgId: params.organizationId,
            ...basicInfo,
            allowNegativeBalance,
            absenceReasonTrackingId,
            description,
          },
        },
      });
      history.push(AbsenceReasonRoute.generate(params));
      /*const id = result.data?.orgRef_AbsenceReasonCategory?.create?.id;
      if (id) {
        history.push(
          AbsenceReasonCategoryViewEditRoute.generate({
            ...params,
            absenceReasonCategoryId: id,
          })
        );
      }*/
    },
    [createAbsenceReasonCategory, basicInfo, params, history]
  );

  const steps: Array<Step> = [
    {
      stepNumber: 0,
      name: t("Basic Info"),
      content: (setStep: React.Dispatch<React.SetStateAction<number>>) => {
        return (
          <AddBasicInfo
            isCategory={true}
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
          <AbsenceReasonCategorySettings
            allowNegativeBalance={false}
            absenceReasonTrackingTypeId={AbsenceReasonTrackingTypeId.Hourly}
            description={""}
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
        <PageTitle title={t("Create new absence reason category")} />
        <Typography variant="h1" className={classes.title}>
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
  title: {
    minHeight: theme.typography.pxToRem(55),
  },
}));
