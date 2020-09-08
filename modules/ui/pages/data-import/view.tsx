import * as React from "react";
import { useState } from "react";
import {
  Grid,
  makeStyles,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Button,
} from "@material-ui/core";
import { TextButton } from "ui/components/text-button";
import { ExpandMore } from "@material-ui/icons";
import { Section } from "ui/components/section";
import { PageTitle } from "ui/components/page-title";
import { DataImportViewRoute, DataImportRoute } from "ui/routes/data-import";
import { useRouteParams } from "ui/routes/definition";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useQueryBundle,
  usePagedQueryBundle,
  useMutationBundle,
} from "graphql/hooks";
import { useDownload } from "hooks/use-download";
import { GetDataImportById } from "./graphql/get-data-import-byid.gen";
import { GetDataImportRows } from "./graphql/get-data-import-rows.gen";
import { DeleteDataImport } from "./graphql/delete-data-import.gen";
import { compact } from "lodash-es";
import { format } from "date-fns";
import { getDisplayName } from "ui/components/enumHelpers";
import { DataImportRowData } from "./components/row-data";
import { PaginationControls } from "ui/components/pagination-controls";
import { RowStatusFilter } from "./components/row-status-filter";
import {
  DataImportRowStatus,
  DataImportStatus,
} from "graphql/server-types.gen";
import { useDataImportTypes } from "reference-data/data-import-types";
import { UpdateDataImport } from "./graphql/update-data-import.gen";
import { ShowErrors, ShowNetworkErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { useHistory } from "react-router";
import { GetDataImportColumnDefinitions } from "./graphql/get-data-import-column-definitions.gen";

export const DataImportViewPage: React.FC<{}> = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(DataImportViewRoute);
  const { openSnackbar } = useSnackbar();
  const history = useHistory();

  const [rowStatusFilter, setRowStatusFilter] = useState<
    DataImportRowStatus | undefined
  >(undefined);

  const [updateDataImport] = useMutationBundle(UpdateDataImport, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [deleteDataImport] = useMutationBundle(DeleteDataImport, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onDeleteDataImport = async () => {
    const result = await deleteDataImport({
      variables: { dataImportId: params.dataImportId },
    });
    if (result.data) {
      history.push(DataImportRoute.generate(params));
    }
  };

  const onRetryDataImport = async (validateOnly: boolean, reRun: boolean) => {
    await updateDataImport({
      variables: {
        dataImport: {
          id: params.dataImportId,
          parseOnly: false,
          validateOnly,
          reRun,
        },
      },
    });
  };

  const getImport = useQueryBundle(GetDataImportById, {
    variables: {
      id: params.dataImportId,
    },
  });

  const [getImportRows, pagination] = usePagedQueryBundle(
    GetDataImportRows,
    r => r.dataImport?.pagedDataImportRows?.totalCount,
    {
      variables: {
        orgId: params.organizationId,
        dataImportId: params.dataImportId,
        rowStatusId: rowStatusFilter,
      },
    }
  );

  const download = useDownload();

  const dataImportTypes = useDataImportTypes();

  const dataImport =
    getImport.state === "DONE" ? getImport.data.dataImport?.byId : undefined;

  const dataImportRows =
    getImportRows.state === "DONE"
      ? compact(
          getImportRows.data.dataImport?.pagedDataImportRows?.results
        ).sort((a, b) => a.rowNumber - b.rowNumber)
      : [];

  const getColumnDefinitions = useQueryBundle(GetDataImportColumnDefinitions, {
    variables: {
      dataImportType: dataImport?.dataImportTypeId,
    },
    skip: !dataImport?.dataImportTypeId,
  });

  const possibleColumnNames =
    getColumnDefinitions.state === "DONE"
      ? compact(
          getColumnDefinitions.data.dataImport?.dataImportTypeColumnDefinition
        )
          .map(a => compact(a.alternateNames))
          .reduce((a, b) => a.concat(b), [])
      : [];

  if (!dataImport) {
    return <></>;
  }

  const rowCountLabel =
    pagination.totalCount === dataImport.totalRowCount
      ? `${pagination.totalCount} ${
          pagination.totalCount === 1 ? t("row") : t("rows")
        }`
      : `${pagination.totalCount} ${t("of")} ${dataImport.totalRowCount} ${
          dataImport.totalRowCount === 1 ? t("row") : t("rows")
        }`;

  const dataImportTypeLabel = dataImportTypes.find(
    o => o.enumValue === dataImport.dataImportTypeId
  )?.description;

  const numFailedRows =
    dataImport.numFailedRows != null || dataImport.numFailedRows != undefined
      ? dataImport.numFailedRows
      : 0;

  return (
    <>
      <Link to={DataImportRoute.generate(params)} className={classes.link}>
        {t("Return to all data imports")}
      </Link>
      <Grid container alignItems="center" justify="space-between">
        <Grid item>
          <PageTitle title={`${dataImportTypeLabel} ${t("data import")}`} />
        </Grid>
        {numFailedRows > 0 && (
          <Grid item>
            <TextButton
              onClick={async () => {
                const fileName = `${dataImport?.fileUpload?.uploadedFileName}_FailedRows.csv`;
                const result = await download(
                  fileName,
                  `${Config.restUri}api/DataImport/FailedRows?dataImportId=${params.dataImportId}`,
                  {
                    method: "POST",
                    body: JSON.stringify({
                      orgId: params.organizationId,
                    }),
                  }
                );
              }}
            >
              {t("Download failed rows")}
            </TextButton>
          </Grid>
        )}
        {dataImport.fileUpload && (
          <Grid item>
            <TextButton
              href={dataImport.fileUpload?.originalFileDownloadUrlSas ?? ""}
            >
              {t("Download original file")}
            </TextButton>
          </Grid>
        )}
      </Grid>
      <Section>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <div className={classes.labelText}>{t("File name")}</div>
            <div className={classes.text}>
              {dataImport.fileUpload?.uploadedFileName ?? t("Not Available")}
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.labelText}>{t("Import status")}</div>
            <div className={classes.text}>
              {getDisplayName(
                "dataImportStatus",
                dataImport.dataImportStatusId,
                t
              )}
            </div>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.labelText}>{t("Created at")}</div>
            <div className={classes.text}>
              {format(new Date(dataImport.createdUtc), "MMM d yyyy, h:mm:ss a")}
            </div>
          </Grid>
          {dataImport.dataImportStatusId === DataImportStatus.Parsed && (
            <Grid item xs={2}>
              <Button
                variant="contained"
                onClick={() => onRetryDataImport(true, true)}
              >
                {t("Validate")}
              </Button>
            </Grid>
          )}
          {(dataImport.dataImportStatusId === DataImportStatus.Validated ||
            dataImport.dataImportStatusId === DataImportStatus.Parsed) && (
            <Grid item xs={2}>
              <Button
                variant="contained"
                onClick={() => onRetryDataImport(false, true)}
              >
                {t("Import")}
              </Button>
            </Grid>
          )}
          {(dataImport.dataImportStatusId ===
            DataImportStatus.PartiallyImported ||
            dataImport.dataImportStatusId ===
              DataImportStatus.ImportFailure) && (
            <Grid item xs={2}>
              <Button
                variant="contained"
                onClick={() => onRetryDataImport(false, true)}
              >
                {t("Retry import")}
              </Button>
            </Grid>
          )}
          <Grid item xs={1}>
            <Button variant="outlined" onClick={() => onDeleteDataImport()}>
              {t("Delete")}
            </Button>
          </Grid>
          {dataImport.messages && dataImport.messages.length > 0 && (
            <Grid item xs={12}>
              <div className={classes.labelText}>{t("Error messages:")}</div>
              {dataImport.messages.map((m, i) => {
                return <div key={i}>{m}</div>;
              })}
            </Grid>
          )}
        </Grid>
      </Section>
      <Section>
        <div className={classes.tableHeaderContainer}>
          <div className={classes.labelText}>{rowCountLabel}</div>
          <RowStatusFilter
            selectedStatusId={rowStatusFilter}
            setSelectedStatusId={status => {
              pagination.resetPage();
              setRowStatusFilter(status);
            }}
          />
          <PaginationControls pagination={pagination} />
        </div>
        <div className={classes.headerContainer}>
          <div className={classes.headerColumn}>{t("Row #")}</div>
          <div className={classes.headerColumn}>{t("Row status")}</div>
        </div>
        {dataImportRows.map((row, i) => (
          <ExpansionPanel defaultExpanded={false} key={i}>
            <ExpansionPanelSummary expandIcon={<ExpandMore />}>
              <div className={classes.rowContainer}>
                <div className={classes.rowNumColumn}>{row.rowNumber}</div>
                <div className={classes.statusColumn}>
                  {getDisplayName("dataImportRowStatus", row.rowStatusId, t)}
                </div>
              </div>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <DataImportRowData
                columnNames={dataImport.columnNames ?? []}
                possibleColumnNames={possibleColumnNames}
                columns={row.columnValues ?? []}
                messages={row.messages}
              />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        ))}
        <PaginationControls pagination={pagination} />
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  rowContainer: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
  },
  tableHeaderContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  labelText: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: 500,
  },
  text: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: 400,
  },
  headerContainer: {
    display: "flex",
    background: theme.customColors.lightGray,
    border: `1px solid ${theme.customColors.medLightGray}`,
  },
  headerColumn: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: 400,
    padding: theme.spacing(2),
    paddingRight: theme.spacing(8),
  },
  statusColumn: {
    paddingLeft: theme.spacing(3),
    flex: 12,
  },
  rowNumColumn: {
    paddingLeft: theme.spacing(1),
    flex: 1,
  },
  downloadLink: {
    color: theme.customColors.blue,
    padding: 0,
    fontWeight: "normal",
    textDecoration: "underline",
    fontSize: theme.typography.pxToRem(14),
    letterSpacing: theme.typography.pxToRem(0.5),

    "&:hover": {
      backgroundColor: "inherit",
      textDecoration: "underline",
    },
  },
  link: {
    color: theme.customColors.blue,
    "&:visited": {
      color: theme.customColors.blue,
    },
  },
}));
