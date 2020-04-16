import * as React from "react";
import {
  Grid,
  makeStyles,
  IconButton,
  Popper,
  Button,
  Fade,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Collapse,
} from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";
import { Section } from "ui/components/section";
import { PageTitle } from "ui/components/page-title";
import { DataImportViewRoute } from "ui/routes/data-import";
import { useRouteParams } from "ui/routes/definition";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { useQueryBundle, usePagedQueryBundle } from "graphql/hooks";
import { GetDataImportById } from "./graphql/get-data-import-byid.gen";
import { GetDataImportRows } from "./graphql/get-data-import-rows.gen";
import { Table } from "ui/components/table";
import { Column } from "material-table";
import { compact } from "lodash-es";
import { format } from "date-fns";
import { getDisplayName } from "ui/components/enumHelpers";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import { DataImportRowData } from "./components/row-data";
import { PaginationControls } from "ui/components/pagination-controls";

export const DataImportViewPage: React.FC<{}> = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const params = useRouteParams(DataImportViewRoute);

  const [rowDataAnchor, setRowDataAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const handleShowRowData = (event: React.MouseEvent<HTMLElement>) => {
    setRowDataAnchor(rowDataAnchor ? null : event.currentTarget);
  };
  const rowDataOpen = Boolean(rowDataAnchor);
  const rowDataId = rowDataOpen ? "rowdata-popper" : undefined;

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
      },
    }
  );

  const dataImport =
    getImport.state === "DONE" ? getImport.data.dataImport?.byId : undefined;

  const dataImportRows =
    getImportRows.state === "DONE"
      ? compact(
          getImportRows.data.dataImport?.pagedDataImportRows?.results
        ).sort((a, b) => a.rowNumber - b.rowNumber)
      : [];

  const columns: Column<GetDataImportRows.Results>[] = [
    { title: t("Row #"), field: "rowNumber", sorting: false },
    {
      title: t("Status"),
      render: data => {
        return getDisplayName("dataImportRowStatus", data.rowStatusId, t);
      },
      sorting: false,
    },
    {
      title: t("Data"),
      sorting: false,
      render: o =>
        !o.columnValues || o.columnValues?.length < 1 ? (
          t("Not available")
        ) : (
          <>
            <Button id={rowDataId} onClick={handleShowRowData}>
              {t("View")}
            </Button>
            <Popper
              transition
              open={rowDataOpen}
              anchorEl={rowDataAnchor}
              placement="bottom-end"
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={150}>
                  <DataImportRowData
                    columnNames={dataImport?.columnNames ?? []}
                    columns={o.columnValues ?? []}
                  />
                </Fade>
              )}
            </Popper>
          </>
        ),
    },
  ];

  if (!dataImport) {
    return <></>;
  }

  const totalRowCount = pagination.totalCount;

  return (
    <>
      <Grid container alignItems="center" justify="space-between">
        <Grid item>
          <PageTitle
            title={`${getDisplayName(
              "dataImportType",
              dataImport.importOptions.dataImportTypeId,
              t
            )} ${t("data import")}`}
          />
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
          <div className={classes.labelText}>{`${totalRowCount} ${
            totalRowCount === 1 ? t("row") : t("rows")
          }`}</div>
          <PaginationControls pagination={pagination} />
        </div>
        <div className={classes.headerContainer}>
          <div className={classes.headerColumn}>{t("Row #")}</div>
          <div className={classes.headerColumn}>{t("Status")}</div>
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
