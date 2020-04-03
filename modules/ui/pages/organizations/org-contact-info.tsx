import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { AppChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import { makeStyles } from "@material-ui/styles";
import { GetOrganizationContactsById } from "ui/pages/organizations/graphql/get-organization-contacts.gen";

export const OrganicationContactInfo: React.FC<{}> = props => {
  const classes = useStyles();
  const userRole = useRouteParams(AppChromeRoute).role;
  const orgId = useRouteParams;

  const getOrganizationContacts = useQueryBundle(GetOrganizationContactsById, {
    variables: { orgId: params.organizationId },
  });

  if (getOrganizationContacts.state === "LOADING") {
    return <></>;
  }

  return <></>;
};

const useStyles = makeStyles(theme => ({}));
