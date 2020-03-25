import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { useHistory } from "react-router";
import { ShowErrors } from "ui/components/error-helpers";
import { useMutationBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { useMemo } from "react";
import { useTimezones } from "reference-data/timezones";
import { useRouteParams } from "ui/routes/definition";
import { useTranslation } from "react-i18next";
import {
  OrganizationCreateInput,
  OrganizationType,
  FeatureFlag,
} from "graphql/server-types.gen";
import { AdminRootChromeRoute } from "ui/routes/app-chrome";
import { CreateOrganization } from "./graphql/create-organization.gen";
import { Typography, makeStyles } from "@material-ui/core";
import { AddBasicInfo } from "./components/add-info";

export const OrganizationAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const params = useRouteParams(AdminRootChromeRoute);
  const [name, setName] = React.useState<string | null>(null);
  const { openSnackbar } = useSnackbar();
  const timeZones = useTimezones();
  const namePlaceholder = t("Glenbrook");

  //Current Staffing Partner OrgId
  const eduStaffOrgId = Config.isDevFeatureOnly ? "1046" : "1003";

  //Mutation
  const [createOrganization] = useMutationBundle(CreateOrganization, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const create = async (newOrganization: OrganizationCreateInput) => {
    const result = await createOrganization({
      variables: {
        organization: {
          ...newOrganization,
        },
      },
    });

    return result?.data;
  };

  const orgTypes = useMemo(() => {
    return [
      {
        value: OrganizationType.Demo,
        label: t("Demo"),
      },
      {
        value: OrganizationType.Implementing,
        label: t("Implementing"),
      },
      {
        value: OrganizationType.Standard,
        label: t("Standard"),
      },
    ];
  }, [t]);

  const featureFlagOptions = useMemo(() => {
    return [
      {
        value: FeatureFlag.None,
        label: t("None"),
      },
      {
        value: FeatureFlag.HourlyAbsences,
        label: t("Hourly"),
      },
      {
        value: FeatureFlag.QuarterDayAbsences,
        label: t("Quarterly"),
      },
      {
        value: FeatureFlag.HalfDayAbsences,
        label: t("Half Day"),
      },
      {
        value: FeatureFlag.FullDayAbsences,
        label: t("Full Day"),
      },
      {
        value: FeatureFlag.Verify,
        label: t("Verify"),
      },
    ];
  }, [t]);

  const timeZoneOptions = timeZones.map(c => {
    return { label: c.name, value: c.enumValue ?? "" };
  });

  return (
    <div className={classes.header}>
      <PageTitle title={t("Create New Organization")} />
      <div className={classes.paddingBottom}>
        <Typography variant="h1">
          {name || (
            <span className={classes.placeholder}>{namePlaceholder}</span>
          )}
        </Typography>
      </div>
      <AddBasicInfo
        namePlaceholder={namePlaceholder}
        organizationTypes={orgTypes}
        relatesToOrganizationId={eduStaffOrgId}
        timeZoneOptions={timeZoneOptions}
        featureFlagOptions={featureFlagOptions}
        onSubmit={async (newOrganization: OrganizationCreateInput) => {
          const result = await create(newOrganization);
          if (result) {
            const url = AdminRootChromeRoute.generate(params);
            history.push(url);
          }
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
  paddingBottom: {
    paddingBottom: theme.spacing(1),
  },
}));
