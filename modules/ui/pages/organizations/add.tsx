import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { ShowErrors } from "ui/components/error-helpers";
import { useMutationBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { useTranslation } from "react-i18next";
import {
  OrganizationCreateInput,
  CountryCode,
  OrganizationConfigInput,
  SeedOrgDataOptionEnum,
  TimeZone,
} from "graphql/server-types.gen";
import { CreateOrganization } from "./graphql/create-organization.gen";
import { Button, Typography, makeStyles } from "@material-ui/core";

export const OrganizationAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [name, setName] = React.useState<string | null>(null);
  const { openSnackbar } = useSnackbar();
  const namePlaceholder = t("Glenbrook District");

  const [organization, setOrganization] = React.useState<
    OrganizationCreateInput
  >({
    name: "",
    externalId: null,
    superUserFirstName: "",
    superUserLastName: "",
    superUserLoginEmail: "",
    timeZoneId: TimeZone.Utc,
    seedOrgDataOption: SeedOrgDataOptionEnum.DontSeed,
    //config:
  });

  //mutation
  const [createOrganization] = useMutationBundle(CreateOrganization, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const create = async (organization: OrganizationCreateInput) => {
    const result = await createOrganization({
      variables: {
        organization: {
          ...organization,
          externalId:
            organization.externalId &&
            organization.externalId.trim().length === 0
              ? null
              : organization.externalId,
        },
      },
    });
    return result?.data?.organization?.create?.id;
  };

  return (
    <div className={classes.header}>
      <PageTitle title={t("Create new organization")} />
      <Typography variant="h1">
        {name || <span className={classes.placeholder}>{namePlaceholder}</span>}
      </Typography>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  fakeStyle: {
    margin: "2px",
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  placeholder: {
    opacity: "0.2",
    filter: "alpha(opacity = 20)",
  },
}));
