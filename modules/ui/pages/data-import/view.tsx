import * as React from "react";
import { useState } from "react";
import {
  Grid,
  makeStyles,
  IconButton,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { Section } from "ui/components/section";
import { PageTitle } from "ui/components/page-title";
import { DataImportViewRoute } from "ui/routes/data-import";
import { useRouteParams } from "ui/routes/definition";
import { useTranslation } from "react-i18next";
import { useQueryBundle, usePagedQueryBundle } from "graphql/hooks";
import { GetDataImportById } from "./graphql/get-data-import-byid.gen";
import { GetDataImportRows } from "./graphql/get-data-import-rows.gen";
import { compact } from "lodash-es";
import { format } from "date-fns";
import { getDisplayName } from "ui/components/enumHelpers";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import { DataImportRowData } from "./components/row-data";
import { PaginationControls } from "ui/components/pagination-controls";
import { RowStatusFilter } from "./components/row-status-filter";
import { DataImportRowStatus } from "graphql/server-types.gen";
import { useDataImportTypes } from "reference-data/data-import-types";

export const DataImportViewPage: React.FC<{}> = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(DataImportViewRoute);

  const [rowStatusFilter, setRowStatusFilter] = useState<
    DataImportRowStatus | undefined
  >(undefined);

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

  const dataImportTypes = useDataImportTypes();

  const dataImport =
    getImport.state === "DONE" ? getImport.data.dataImport?.byId : undefined;

  const dataImportRows =
    getImportRows.state === "DONE"
      ? compact(
          getImportRows.data.dataImport?.pagedDataImportRows?.results
        ).sort((a, b) => a.rowNumber - b.rowNumber)
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

  return (
    <>
      <Grid container alignItems="center" justify="space-between">
        <Grid item>
          <PageTitle title={`${dataImportTypeLabel} ${t("data import")}`} />
        </Grid>
        {dataImport.fileUpload && (
          <Grid item>
            <IconButton
              href={dataImport.fileUpload?.originalFileDownloadUrlSas ?? ""}
              target={"_blank"}
              rel={"noreferrer"}
            >
              <CloudDownloadIcon />
            </IconButton>
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
              {format(new Date(dataImport.createdUtc), "MMM d, h:mm:ss a")}
            </div>
          </Grid>
        </Grid>
      </Section>
      <Section>
        <div className={classes.tableHeaderContainer}>
          <div className={classes.labelText}>{rowCountLabel}</div>
          <RowStatusFilter
            selectedStatusId={rowStatusFilter}
            setSelectedStatusId={setRowStatusFilter}
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
                columnNames={dataImport?.columnNames ?? []}
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
}));
