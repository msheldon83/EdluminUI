import * as React from "react";
import { useHistory } from "react-router";
import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { useRouteParams } from "ui/routes/definition";
import { PageTitle } from "ui/components/page-title";
import { useOrganizationId } from "core/org-context";
import { GetApplicationGrantById } from "./graphql/get-application-grant.gen";
import { IntegrationRoute, IntegrationViewRoute } from "ui/routes/integration";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { ApplicationLogo } from "./components/application-logo";
import { BaseLink } from "ui/components/links/base";
import { CopyableNameValue } from "ui/components/copyable-name-value";
import { ApplicationConnectionUI } from "./components/application-connection";

type Props = {};

export const IntegrationView: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const params = useRouteParams(IntegrationViewRoute);
  const orgId = useOrganizationId();

  const appGrantQuery = useQueryBundle(GetApplicationGrantById, {
    variables: { id: params.applicationGrantId },
  });

  if (appGrantQuery.state === "LOADING") {
    return <></>;
  }

  const appGrant = appGrantQuery?.data?.applicationGrant?.byId;
  if (appGrant == null) {
    return <></>;
  }

  return (
    <>
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          <BaseLink
            to={IntegrationRoute.generate({
              organizationId: orgId ?? "",
            })}
          >
            {t("Return to all connections")}
          </BaseLink>
          <Typography variant="h5" className={classes.subHeader}>
            {t("Connections")}
          </Typography>
          <PageTitle title={appGrant.application.name} />
        </Grid>
      </Grid>
      <Section>
        <Grid container spacing={2}>
          <Grid item xs={7}>
            <SectionHeader title={t("Credentials")}></SectionHeader>
            <Grid container spacing={2}>
              {appGrant.application?.orgId && (
                <>
                  <Grid item xs={12}>
                    <CopyableNameValue
                      name={t("API username")}
                      value={appGrant.application?.basicAuthName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CopyableNameValue
                      name={t("API password")}
                      value={appGrant.application?.basicAuthName}
                      masked
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <CopyableNameValue
                  name={t("API key")}
                  value={appGrant.apiKey}
                  masked
                />
              </Grid>
              {/* <Grid item xs={12}>
                <CopyableNameValue
                  name={t("FTP address")}
                  value="ftp.redroverk12.com"
                />
              </Grid>
              <Grid item xs={12}>
                <CopyableNameValue
                  name={t("FTP username")}
                  value={appGrant.ftpUserName}
                />
              </Grid>
              <Grid item xs={12}>
                <CopyableNameValue
                  name={t("FTP password")}
                  value={appGrant.ftpPassword}
                  masked
                />
              </Grid> */}
            </Grid>
          </Grid>
          <Grid item xs={5} className={classes.appInfo}>
            <div className={classes.logoBox}>
              <ApplicationLogo
                logo={appGrant.application?.logoUrl}
                isPrivate={!!appGrant.application?.orgId}
              />
            </div>
            {appGrant.application?.helpUrl && (
              <div>
                <a
                  href={appGrant.application?.helpUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {appGrant.application?.helpUrl}
                </a>
              </div>
            )}
          </Grid>
        </Grid>
      </Section>
      {appGrant.connections.map(c => (
        <ApplicationConnectionUI
          key={c.id}
          appName={appGrant.application.name}
          connection={c}
        />
      ))}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  appInfo: {
    textAlign: "right",
  },
  logoBox: {
    padding: 3,
    display: "inline-block",
    width: 100,
    "& img": {
      width: "100%",
    },
    "& svg": {
      width: "100%",
      height: 100,
    },
  },

  subHeader: {
    color: "#FF5555",
  },
}));
