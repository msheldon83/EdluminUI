import * as React from "react";
import { useState } from "react";
import { useHistory } from "react-router";
import { Link as RouterLink } from "react-router-dom";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { compact } from "lodash-es";
import { parseAndFormat } from "../../components/date-helpers";
import {
  Grid,
  makeStyles,
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Typography,
  Link,
  SvgIconProps,
  Button,
} from "@material-ui/core";
import { useRouteParams } from "ui/routes/definition";
import { PageTitle } from "ui/components/page-title";
import { useSnackbar } from "hooks/use-snackbar";
import { useOrganizationId } from "core/org-context";
import { GetApplicationGrantById } from "./graphql/get-application-grant.gen";
import { IntegrationRoute, IntegrationViewRoute } from "ui/routes/integration";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import {
  ApplicationConnection,
  ConnectionDirection,
  PermissionEnum,
} from "graphql/server-types.gen";
import { ApplicationLogo } from "./components/ApplicationLogo";
// import { ShowErrors, ShowGenericErrors } from "ui/components/error-helpers";
// import { Can } from "ui/components/auth/can";

type Props = {};

export const IntegrationView: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const params = useRouteParams(IntegrationViewRoute);

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
          <Typography variant="h5">{t("Integrations")}</Typography>
          <PageTitle title={appGrant.application!.name!} />
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
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <CopyableNameValue
                  name={t("API key")}
                  value={appGrant.apiKey}
                />
              </Grid>
              <Grid item xs={12}>
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
              </Grid>
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
          appName={appGrant.application!.name!}
          connection={c}
        />
      ))}
    </>
  );
};

type AppConnectionUIProps = {
  appName: string;
  connection: Pick<
    ApplicationConnection,
    | "id"
    | "name"
    | "active"
    | "apiEnabled"
    | "ftpEnabled"
    | "createdLocal"
    | "definition"
    | "path"
    | "lastScheduledRun"
    | "nextScheduledRun"
    | "direction"
    | "applicationPresetId"
    | "fileNameFormat"
    | "fileFormat"
  >;
};

const ApplicationConnectionUI: React.FC<AppConnectionUIProps> = ({
  appName,
  connection,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  const handleRunNow = () => {
    alert("run now");
  };

  return (
    <Section>
      <Grid container spacing={2}>
        <div className={classes.cardHeader}>
          {/* <div className={classes.actions}>
            <Button variant="contained" className={classes.deleteButton}>
              Delete
            </Button>
            <Button variant="outlined" className={classes.actionButton}>
              Disable
            </Button>
            <Button variant="outlined" className={classes.actionButton}>
              Edit
            </Button>
          </div> */}
          <Typography variant="h5">{connection.name}</Typography>
          <div>
            <ConnectionDirectionText
              direction={connection.direction}
              appName={appName}
              className={classes.connectionDescription}
            />
          </div>
        </div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CopyableNameValue name={t("FTP folder")} value={connection.path} />
          </Grid>
          {/* <Grid item xs={12}>
              <Typography variant="h6">{t("Schedule")}</Typography>
              <Typography>{connection.humanSchedule}</Typography>
            </Grid> */}
          <Grid container item xs={12}>
            <Grid item xs={3}>
              <Typography variant="h6">{t("Last run")}</Typography>
              <Typography>
                {parseAndFormat(connection.lastScheduledRun, "MMM d, h:m A") ??
                  "--"}
              </Typography>
              {/* <Link>View history</Link> */}
            </Grid>
            <Grid item xs={3}>
              <Typography variant="h6">{t("Next run")}</Typography>
              <Typography>
                {parseAndFormat(connection.nextScheduledRun, "MMM d, h:m A") ??
                  "--"}
              </Typography>
              <Link onClick={handleRunNow}>Run now</Link>
            </Grid>
          </Grid>
          <Grid container item xs={12}>
            <Grid item xs={3}>
              <Typography variant="h6">{t("File name")}</Typography>
              <Typography>{connection.fileNameFormat ?? "--"}</Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="h6">{t("Format")}</Typography>
              <Typography>{connection.fileFormat ?? "--"}</Typography>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">{t("Definition")}</Typography>
            {/* <RouterLink>View</RouterLink> */}
          </Grid>
        </Grid>
      </Grid>
    </Section>
  );
};

type AppPresetUIProps = {
  preset: { id: string; name: string; direction: ConnectionDirection };
  appName: string;
};
const ApplicationPresetUI: React.FC<AppPresetUIProps> = ({
  preset,
  appName,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Section>
      <div className={classes.cardHeader}>
        <Typography variant="h5">{preset.name}</Typography>
        <div>
          <ConnectionDirectionText
            direction={preset.direction}
            appName={appName}
          />
        </div>
        <div className={classes.actions}></div>
      </div>
    </Section>
  );
};

const ConnectionDirectionText: React.FC<{
  direction: ConnectionDirection;
  appName: string;
  className?: string;
}> = ({ direction, appName, className }) => {
  const { t } = useTranslation();
  return (
    <Typography className={className}>
      {direction == ConnectionDirection.Outbound
        ? `${t("From Red Rover to")} ${appName}`
        : `${t("From")} ${appName} ${t("to Red Rover")}`}
    </Typography>
  );
};

const CopyButton: React.FC<{ name: string; value: string } & SvgIconProps> = ({
  name,
  value,
  ...svgProps
}) => {
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const copyToClipboard = (name: string, value: string) => {
    navigator.clipboard.writeText(value);
    snackbar.openSnackbar({
      message: `${name} ${t("copied to clipboard")}`,
      autoHideDuration: 2000,
      dismissable: true,
      status: "success",
    });
  };

  return (
    <FileCopyIcon
      fontSize="inherit"
      onClick={() => copyToClipboard(name, value)}
      {...svgProps}
    />
  );
};

const CopyableNameValue: React.FC<{
  name: string;
  value?: string | null;
  masked?: boolean;
}> = ({ name, value, masked = false }) => {
  const [show, setShow] = useState(!masked);
  const classes = useStyles();
  return (
    <>
      <Typography variant="h6">{name}</Typography>
      {value ? (
        <Typography>
          {show ? value : "***********"}
          <CopyButton name={name} value={value} className={classes.fieldIcon} />
          {masked &&
            (show ? (
              <VisibilityOffIcon
                onClick={() => setShow(false)}
                className={classes.fieldIcon}
                fontSize="inherit"
              />
            ) : (
              <VisibilityIcon
                onClick={() => setShow(true)}
                className={classes.fieldIcon}
                fontSize="inherit"
              />
            ))}
        </Typography>
      ) : (
        <Typography>--</Typography>
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  fieldIcon: {
    marginLeft: theme.spacing(1),
  },
  cardHeader: {
    marginBottom: theme.spacing(2),
    width: "100%",
  },
  actions: {
    float: "right",
  },
  actionButton: {
    marginLeft: theme.spacing(2),
    color: theme.actions.primary,
  },
  deleteButton: {
    backgroundColor: theme.status.error,
  },
  connectionDescription: {
    color: theme.customColors.edluminSubText,
  },
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
}));
