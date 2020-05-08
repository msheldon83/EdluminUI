import * as React from "react";
import { Typography, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { ManageDistrictsUI } from "./ui";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useMemo } from "react";
import { AddRelatedOrg } from "./graphql/add-related-org.gen";
import { RemoveRelatedOrg } from "./graphql/remove-related-org.gen";
import { compact } from "lodash-es";
import { GetAdminRelatedOrgs } from "./graphql/get-admin-related-orgs.gen";
import { PeopleSubRelatedOrgsEditRoute } from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { CustomOrgUserRelationship } from "ui/pages/sub-related-orgs/helpers";
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

  const relationships: CustomOrgUserRelationship[] = useMemo(
    () =>
      orgUserRelationships.map(
        o =>
          ({
            otherOrganization: o.otherOrganization,
            attributes: [],
          } ?? [])
      ),
    [orgUserRelationships]
  );

  if (
    getAdminRelatedOrgs.state === "LOADING" ||
    !orgUser?.orgUserRelationships
  ) {
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
        orgUserRelationships={relationships}
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
