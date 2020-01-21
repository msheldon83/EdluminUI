import * as React from "react";
import { Typography, makeStyles } from "@material-ui/core";
import { PageTitle } from "ui/components/page-title";
import { useTranslation } from "react-i18next";
import { RelatedOrgsUI } from "./ui";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetSubstituteRelatedOrgs } from "./graphql/get-subrelatedorgs.gen";
import { AddRelatedOrg } from "./graphql/add-relatedorg.gen";
import { RemoveRelatedOrg } from "./graphql/remove-relatedorg.gen";
import { PeopleSubRelatedOrgsEditRoute } from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";

type Props = {};

export const SubRelatedOrgsEditPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(PeopleSubRelatedOrgsEditRoute);
  const classes = useStyles();

  const [addRelatedOrg] = useMutationBundle(AddRelatedOrg, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [removeRelatedOrg] = useMutationBundle(RemoveRelatedOrg, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const getSubRelatedOrgs = useQueryBundle(GetSubstituteRelatedOrgs, {
    variables: {
      id: params.orgUserId,
    },
  });

  const orgUser =
    getSubRelatedOrgs.state === "LOADING"
      ? undefined
      : getSubRelatedOrgs?.data?.orgUser?.byId;

  if (getSubRelatedOrgs.state === "LOADING" || !orgUser?.substitute) {
    return <></>;
  }

  const relatedOrgs = orgUser.relatedOrgIds ?? [];

  const handleAdd = async (orgId: string) => {
    await addRelatedOrg({
      variables: {
        orgUserId: params.orgUserId,
        relatedOrgId: orgId,
      },
    });
    await getSubRelatedOrgs.refetch();
  };

  const handleRemove = async (orgId: string) => {
    await removeRelatedOrg({
      variables: {
        orgUserId: params.orgUserId,
        relatedOrgId: orgId,
      },
    });
    await getSubRelatedOrgs.refetch();
  };

  return (
    <>
      <div className={classes.header}>
        <PageTitle title={`${orgUser?.firstName} ${orgUser?.lastName}`} />
        <Typography variant="h1">{t("Districts")}</Typography>
      </div>
      <RelatedOrgsUI
        relatedOrgIds={relatedOrgs}
        onAdd={handleAdd}
        onRemove={handleRemove}
        orgId={params.organizationId}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
}));
