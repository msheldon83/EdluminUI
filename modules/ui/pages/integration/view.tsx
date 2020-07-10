import * as React from "react";
import { useState } from "react";
import { useHistory } from "react-router";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { compact } from "lodash-es";
import { parseAndFormat } from "../../components/date-helpers"
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
} from "@material-ui/core";
import { useRouteParams } from "ui/routes/definition";
import { PageTitle } from "ui/components/page-title";
import { useSnackbar } from "hooks/use-snackbar";
import { useOrganizationId } from "core/org-context";
import { GetApplicationGrantById } from "./graphql/get-application-grant.gen";
import { IntegrationRoute, IntegrationViewRoute } from "ui/routes/integration";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import FileCopyIcon from '@material-ui/icons/FileCopy';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import {
  ApplicationConnection,
  ConnectionDirection,
} from "graphql/server-types.gen";
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
              
                <Grid item xs={12}>
                  <CopyableNameValue name={t("API key")} value={appGrant.apiKey}/>
                </Grid>
                <Grid item xs={12}>
                  <CopyableNameValue name={t("FTP address")} value="ftp.redroverk12.com"/>
                </Grid>
                <Grid item xs={12}>
                  <CopyableNameValue name={t("FTP username")} value={appGrant.ftpUserName}/>
                </Grid>
                <Grid item xs={12}>
                  <CopyableNameValue name={t("FTP password")} value={appGrant.ftpPassword} masked />
                </Grid>
              
            </Grid>
          </Grid>
          <Grid item xs={5}>logo and info</Grid>
        </Grid>
      </Section>
      {appGrant.connections.map(c => <ApplicationConnectionUI key={c.Id} appName={appGrant.application!.name!} connection={c} />)}
    </>
  );
};

type  AppConnectionUIProps = {
  appName: string,
  connection: Pick<ApplicationConnection, 'id' | 'name' | 'active' | 'apiEnabled' | 'ftpEnabled' | 'createdLocal' | 'definition' | 'path' | 'lastScheduledRun' | 'nextScheduledRun' | 'direction' | 'applicationPresetId' | 'fileNameFormat' | "fileFormat">
}
const ApplicationConnectionUI : React.FC<AppConnectionUIProps> = ({appName, connection}) => {
  const { t } = useTranslation();
  return (<Section>
    <Grid container spacing={2}>
        <SectionHeader title={connection.name} actions={[
          {text:t("Delete"), permissions: [PermissionEnum.ExternalConnectionDelete]},
          {text:t("Disable"), permissions: [PermissionEnum.ExternalConnectionSave]},
          {text:t("Edit"), permissions: [PermissionEnum.ExternalConnectionSave]},
        ]}/>
        <ConnectionDirectionText direction={connection.direction} appName={appName} />
        <Grid container spacing={2}>
            <Grid item xs={12}>
              <CopyableNameValue name={t("FTP folder")} value={connection.path}/>
            </Grid>
            {/* <Grid item xs={12}>
              <Typography variant="h6">{t("Schedule")}</Typography>
              <Typography>{connection.humanSchedule}</Typography>
            </Grid> */}
            <Grid container item xs={12}>
              <Grid item xs={3}>
                <Typography variant="h6">{t("Last run")}</Typography>
                <Typography>{parseAndFormat(connection.lastScheduledRun, "MMM d, h:m A") ?? "--"}</Typography>
                <Link>View history</Link>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h6">{t("Next run")}</Typography>
                <Typography>{parseAndFormat(connection.nextScheduledRun, "MMM d, h:m A") ?? "--"}</Typography>
                <Link>Run now</Link>
              </Grid>
            </Grid>
            <Grid container item xs={12}>
              <Grid item xs={3}>
                <Typography variant="h6">{t("File name")}</Typography>
                <Typography>{connection.fileNameFormat}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h6">{t("Format")}</Typography>
                <Typography>{connection.fileFormat}</Typography>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">{t("Definition")}</Typography>
              {/* <Link>View</Link> */}
            </Grid>
          
      </Grid>
    </Grid>
  </Section>);
};

type AppPresetUIProps = { preset : { id: string, name : string, direction : ConnectionDirection}; appName: string};
const ApplicationPresetUI : React.FC<AppPresetUIProps> = ({preset, appName}) => {

  const { t } = useTranslation();
  return(
  <Section>
    <SectionHeader title={preset.name} actions={[{text:t("Enable")}]}/>
    <ConnectionDirectionText direction={preset.direction} appName={appName} />
  </Section>);
};

const ConnectionDirectionText : React.FC<{direction: ConnectionDirection, appName: string}> = ({direction, appName}) => 
    (<Typography>
          {direction == ConnectionDirection.Outbound ? 
          `${t("From Red Rover to")} ${appName}` :
          `${t("From")} ${appName} ${t("to Red Rover")}`
        }
      </Typography>);


const CopyButton : React.FC<{ name: string; value: string; }> = ({name, value}) => {
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const copyToClipboard = (name: string, value: string) => {
    navigator.clipboard.writeText(value);
    snackbar.openSnackbar({message: `${name} ${t('copied to clipboard')}`, autoHideDuration: 2000, dismissable: true, status: "success" })
  }

  return <FileCopyIcon fontSize="inherit" onClick={() => copyToClipboard(name, value)} />;
};

const CopyableNameValue : React.FC<{ name: string; value: string?; masked: boolean?; }> = ({name, value, masked = false}) => {
    const [show, setShow] = useState(!masked);
    return (
      <>
        <Typography variant="h6">{name}</Typography>
        {value ? (
          <Typography>
            {show ? value : "***********"}
            <CopyButton name={name} value={value}/>
            {masked && (show ? <VisibilityOffIcon  fontSize="small" onClick={() => setShow(false)}/> : <VisibilityIcon  fontSize="small" onClick={() => setShow(true)}/>)}
          </Typography>)
          :
          <Typography>--</Typography>
        }
      </>
    );
  };


const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(),
  },
}));
