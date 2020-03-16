import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { useHistory } from "react-router";
import { ShowErrors } from "ui/components/error-helpers";
import { useMutationBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { useRouteParams } from "ui/routes/definition";
import { useTranslation } from "react-i18next";
import {
  OrganizationCreateInput,
  CountryCode,
  OrganizationConfigInput,
  SeedOrgDataOptionEnum,
  TimeZone,
} from "graphql/server-types.gen";
import { AdminRootChromeRoute } from "ui/routes/app-chrome";
import { CreateOrganization } from "./graphql/create-organization.gen";
import { Button, Typography, makeStyles } from "@material-ui/core";
import { AddBasicInfo } from "./components/add-info";

export const OrganizationAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const params = useRouteParams(AdminRootChromeRoute);
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
    // config: OrganizationConfigInput,
  });

  //Mutation
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
      <AddBasicInfo
        namePlaceholder={namePlaceholder}
        organization={organization}
        onSubmit={(name, externalId) => {
          setOrganization({
            ...organization,
            name: name,
            externalId: externalId,
          });
        }}
        onCancel={() => {
          const url = AdminRootChromeRoute.generate(params);
          history.push(url);
        }}
        onNameChange={name => setName(name)}
      />
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
