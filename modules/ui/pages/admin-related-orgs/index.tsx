import * as React from "react";
import { Typography, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { ManageDistrictsUI } from "./ui";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { AddRelatedOrg } from "./graphql/add-related-org.gen";
import { RemoveRelatedOrg } from "./graphql/remove-related-org.gen";
import { GetAdminRelatedOrgs } from "./graphql/get-admin-related-orgs.gen";
import { compact } from "lodash-es";
import { PeopleSubRelatedOrgsEditRoute } from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";

export const AdminRelatedOrgsEditPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(PeopleSubRelatedOrgsEditRoute);
  const classes = useStyles();

  const getAdminRelatedOrgs = useQueryBundle(GetAdminRelatedOrgs, {
    variables: {
      id: params.orgUserId,
    },
  });

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

  const orgUser =
    getAdminRelatedOrgs.state === "LOADING"
      ? undefined
      : getAdminRelatedOrgs?.data?.orgUser?.byId;

  const orgUserRelationships = compact(orgUser?.orgUserRelationships) ?? [];

  if (getAdminRelatedOrgs.state === "LOADING" || !orgUser) {
    return <></>;
  }

  const handleAddOrg = async (orgId: string) => {
    await addRelatedOrg({
      variables: {
        orgUserId: params.orgUserId,
        relatedOrgId: orgId,
      },
    });
    await getAdminRelatedOrgs.refetch();
  };

  const handleRemoveOrg = async (orgId: string) => {
    await removeRelatedOrg({
      variables: {
        orgUserId: params.orgUserId,
        relatedOrgId: orgId,
      },
    });
    await getAdminRelatedOrgs.refetch();
  };

  return (
    <>
      <div className={classes.container}>
        <Typography className={classes.header} variant="h4">
          {`${orgUser?.firstName} ${orgUser?.lastName}`}
        </Typography>
        <Typography variant="h1">{t("Districts")}</Typography>
      </div>
      <ManageDistrictsUI
        onAddOrg={handleAddOrg}
        onRemoveOrg={handleRemoveOrg}
        orgUserRelationships={orgUserRelationships}
        orgId={params.organizationId}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
    fontSize: theme.typography.pxToRem(24),
    fontWeight: 400,
  },
  container: {
    marginBottom: theme.spacing(2),
  },
}));
