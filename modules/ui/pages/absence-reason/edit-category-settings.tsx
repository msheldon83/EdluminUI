import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { AbsenceReasonTrackingTypeId } from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageHeader } from "ui/components/page-header";
import { PageTitle } from "ui/components/page-title";
import {
  AbsenceReasonCategoryEditSettingsRoute,
  AbsenceReasonCategoryViewEditRoute,
} from "ui/routes/absence-reason";
import { useRouteParams } from "ui/routes/definition";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { makeStyles } from "@material-ui/styles";
import { GetAllAbsenceReasonCategoriesDocument } from "reference-data/get-absence-reason-categories.gen";
import { GetAbsenceReasonCategory } from "./graphql/get-absence-reason-category.gen";
import { UpdateAbsenceReasonCategory } from "./graphql/update-absence-reason-category.gen";
import { AbsenceReasonCategorySettings } from "./absence-reason-categories-settings";

type Props = {};

export const AbsenceReasonCategoryEditSettingsPage: React.FC<Props> = () => {
  const params = useRouteParams(AbsenceReasonCategoryEditSettingsRoute);
  const history = useHistory();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const absenceReasonCategoriesReferenceQuery = {
    query: GetAllAbsenceReasonCategoriesDocument,
    variables: { orgId: params.organizationId },
  };

  const getAbsenceReasonCategory = useQueryBundle(GetAbsenceReasonCategory, {
    fetchPolicy: "cache-and-network",
    variables: {
      absenceReasonCategoryId: params.absenceReasonCategoryId,
    },
  });

  const [mutation] = useMutationBundle(UpdateAbsenceReasonCategory, {
    refetchQueries: [absenceReasonCategoriesReferenceQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const updateAbsenceReasonCategory = async (updatedValues: {
    allowNegativeBalance: boolean;
    description?: string;
    code?: string;
    absenceReasonTrackingTypeId?: AbsenceReasonTrackingTypeId;
  }) => {
    if (getAbsenceReasonCategory.state !== "DONE") {
      return;
    }
    const reason = getAbsenceReasonCategory.data.orgRef_AbsenceReasonCategory
      ?.byId!;
    const {
      allowNegativeBalance,
      description,
      code,
      absenceReasonTrackingTypeId: absenceReasonTrackingId,
    } = updatedValues;

    const result = await mutation({
      variables: {
        absenceReasonCategory: {
          id: reason.id,
          rowVersion: reason.rowVersion,
          allowNegativeBalance,
          description,
          code,
          absenceReasonTrackingId,
        },
      },
    });
    if (result.data) {
      history.push(AbsenceReasonCategoryViewEditRoute.generate(params));
    }
  };

  if (
    getAbsenceReasonCategory.state !== "DONE" &&
    getAbsenceReasonCategory.state !== "UPDATING"
  ) {
    return <></>;
  }
  const absenceReasonCategory = getAbsenceReasonCategory.data
    .orgRef_AbsenceReasonCategory?.byId!;

  return (
    <>
      <PageTitle title={t("Absence Reason")} withoutHeading={!isMobile} />
      <PageHeader text={absenceReasonCategory.name} label={t("Name")} />

      <AbsenceReasonCategorySettings
        description={absenceReasonCategory.description || undefined}
        code={absenceReasonCategory.code || undefined}
        allowNegativeBalance={absenceReasonCategory.allowNegativeBalance}
        absenceReasonTrackingTypeId={
          absenceReasonCategory.absenceReasonTrackingTypeId || undefined
        }
        onSubmit={updateAbsenceReasonCategory}
        onCancel={() => {
          history.push(AbsenceReasonCategoryViewEditRoute.generate(params));
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
