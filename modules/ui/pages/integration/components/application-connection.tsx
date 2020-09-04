import * as React from "react";
import { useState } from "react";
import { useLazyQueryPromise } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { DownloadConnectionQuery } from "../graphql/download-connection";
import { Grid, makeStyles, Typography, Button } from "@material-ui/core";
import { useSnackbar } from "hooks/use-snackbar";
import { Section } from "ui/components/section";
import {
  ApplicationConnection,
  ReportFilterField,
} from "graphql/server-types.gen";
import { ConnectionDirectionText } from "./connection-direction";
import { RunNowDialog } from "./run-now-dialog";
import { CopyableNameValue } from "ui/components/copyable-name-value";

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
    | "replaceableFilters"
    | "path"
    | "lastScheduledRun"
    | "nextScheduledRun"
    | "direction"
    | "applicationPresetId"
    | "fileNameFormat"
    | "fileFormat"
  >;
};

export const ApplicationConnectionUI: React.FC<AppConnectionUIProps> = ({
  appName,
  connection,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const [runNowOpen, setRunNowOpen] = useState(false);

  const [download] = useLazyQueryPromise(DownloadConnectionQuery.Document);

  const handleRunNow = () => {
    setRunNowOpen(true);
  };

  // HACK.  Right now we only have date range to worry about
  const buildFilterString = (filter: ReportFilterField) => {
    const fieldName = filter.displayName;
    let [start, end] = filter.arguments;
    if (start[0] !== "%") start = `'${start}'`;
    if (end[0] !== "%") end = `'${end}'`;

    return `${fieldName} BETWEEN ${start} AND ${end}`;
  };

  const handleDownload = async (filters: ReportFilterField[]) => {
    const filterStrings = filters.map(f => buildFilterString(f));

    return await download({
      filters: filterStrings,
      connectionId: connection.id,
    });
  };

  return (
    <>
      {runNowOpen && (
        <RunNowDialog
          open={runNowOpen}
          initialFilters={connection.replaceableFilters}
          download={handleDownload}
          close={() => setRunNowOpen(false)}
        />
      )}
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
            {/*<Grid item xs={12}>
              <CopyableNameValue
                name={t("FTP folder")}
                value={connection.path}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">{t("Schedule")}</Typography>
              <Typography>{connection.humanSchedule}</Typography>
            </Grid> */}
            {/* <Grid container item xs={12}>
              <Grid item xs={3}>
                <Typography variant="h6">{t("Last run")}</Typography>
                <Typography>
                  {parseAndFormat(
                    connection.lastScheduledRun,
                    "MMM d, h:m A"
                  ) ?? "--"}
                </Typography>
                <Link>View history</Link>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="h6">{t("Next run")}</Typography>
                <Typography>
                  {parseAndFormat(
                    connection.nextScheduledRun,
                    "MMM d, h:m A"
                  ) ?? "--"}
                </Typography>
                <Link onClick={handleRunNow}>Run now</Link>
              </Grid>
            </Grid> */}
            <Grid container item xs={12}>
              <Grid item xs={3}>
                <Button variant="outlined" onClick={handleRunNow}>
                  Run now
                </Button>
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
            {/* <Grid item xs={12}>
              <Typography variant="h6">{t("Definition")}</Typography>
              <RouterLink>View</RouterLink>
            </Grid> */}
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
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
}));
