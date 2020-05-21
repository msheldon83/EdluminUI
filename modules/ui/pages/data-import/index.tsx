import * as React from "react";
import { useState, useMemo } from "react";
import {
  Grid,
  makeStyles,
  Divider,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography,
} from "@material-ui/core";
import { PageTitle } from "ui/components/page-title";
import {
  DataImportRoute,
  DataImportViewRoute,
  DataImportColumnDefinitionsRoute,
} from "ui/routes/data-import";
import { useRouteParams } from "ui/routes/definition";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { usePagedQueryBundle } from "graphql/hooks";
import { GetDataImports } from "./graphql/get-data-imports.gen";
import { Table } from "ui/components/table";
import { Column } from "material-table";
import { compact } from "lodash-es";
import { format, addDays } from "date-fns";
import { getDisplayName } from "ui/components/enumHelpers";
import { ImportFilters } from "./components/import-filters";
import { DataImportStatus, DataImportType } from "graphql/server-types.gen";
import { ImportDataForm } from "ui/components/data-import/import-data-form";
import { useDataImportTypes } from "reference-data/data-import-types";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Section } from "ui/components/section";
import { ActionMenu } from "ui/components/action-menu";

export const DataImportPage: React.FC<{}> = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const params = useRouteParams(DataImportRoute);
  const [panelOpened, setPanelOpened] = React.useState(false);

  const [importStatusFilter, setImportStatusFilter] = useState<
    DataImportStatus | undefined
  >(undefined);
  const [importTypeFilter, setImportTypeFilter] = useState<
    DataImportType | undefined
  >(undefined);

  const today = useMemo(() => new Date(), []);
  const [fromDate, setFromDate] = useState<Date | string>(addDays(today, -7));
  const [toDate, setToDate] = useState<Date | string>(today);

  const dataImportTypes = useDataImportTypes();

  const [getImports, pagination] = usePagedQueryBundle(
    GetDataImports,
    r => r.dataImport?.paged?.totalCount,
    {
      variables: {
        orgId: params.organizationId,
        status: importStatusFilter,
        type: importTypeFilter,
        fromDate: fromDate,
        toDate: toDate,
        sortBy: [
          {
            sortByPropertyName: "id",
            sortAscending: false,
          },
        ],
      },
    }
  );

  const refetchImports = async () => {
    await getImports.refetch();
  };

  const dataImports =
    getImports.state === "DONE"
      ? compact(getImports.data.dataImport?.paged?.results)
      : [];

  const columns: Column<GetDataImports.Results>[] = [
    {
      title: t("File name"),
      render: data => {
        return data.fileUpload?.uploadedFileName ?? t("Not Available");
      },
      sorting: false,
    },
    { title: t("Row count"), field: "totalRowCount", sorting: false },
    {
      title: t("Created"),
      render: data => {
        return format(new Date(data.createdUtc), "MMM d, h:mm:ss a");
      },
      sorting: false,
    },
    {
      title: t("Status"),
      render: data => {
        return getDisplayName("dataImportStatus", data.dataImportStatusId, t);
      },
      sorting: false,
    },
    {
      title: t("Type"),
      render: data => {
        return dataImportTypes.find(x => x.enumValue === data.dataImportTypeId)
          ?.description;
      },
      sorting: false,
    },
    {
      title: t("Action"),
      render: data => {
        if (data.parseOnly) {
          return t("Parse only");
        } else if (data.validateOnly) {
          return t("Validate only");
        } else {
          return t("Import");
        }
      },
      sorting: false,
    },
  ];

  const dataImportCount = pagination.totalCount;

  const onImportClose = () => {
    setPanelOpened(false);
  };

  const resetPageWrapper: <T, S>(f: (t: T) => S) => (t: T) => S = f => t => {
    pagination.goToPage(1);
    return f(t);
  };

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        justify="space-between"
        spacing={2}
        className={classes.header}
      >
        <Grid item>
          <PageTitle title={t("Data imports")} />
        </Grid>
        <Grid item>
          <ActionMenu
            options={[
              {
                name: t("Instructions"),
                onClick: () => {
                  window.open(
                    "https://help.redroverk12.com/hc/en-us/articles/360041684611-Preparing-your-data-for-Import-into-Red-Rover?flash_digest=048d6532359da246f39391e77e3bb2b9ac5bf209",
                    "_blank"
                  );
                },
              },
              {
                name: t("Column definitions"),
                onClick: () => {
                  history.push(
                    DataImportColumnDefinitionsRoute.generate(params)
                  );
                },
              },
            ]}
          />
        </Grid>
      </Grid>
      <Section className={classes.container}>
        <ExpansionPanel expanded={panelOpened}>
          <ExpansionPanelSummary
            onClick={event => {
              setPanelOpened(!panelOpened);
            }}
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography variant="h5">{t("Import data")}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <ImportDataForm
              orgId={params.organizationId}
              onClose={onImportClose}
              refetchImports={refetchImports}
            />
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Section>
      <Section>
        <ImportFilters
          selectedStatusId={importStatusFilter}
          setSelectedStatusId={resetPageWrapper(setImportStatusFilter)}
          selectedTypeId={importTypeFilter}
          setSelectedTypeId={resetPageWrapper(setImportTypeFilter)}
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={resetPageWrapper(setFromDate)}
          setToDate={resetPageWrapper(setToDate)}
        />
        <Divider className={classes.divider} />
        <Table
          title={`${dataImportCount} ${
            dataImportCount === 1 ? t("import") : t("imports")
          }`}
          columns={columns}
          data={dataImports}
          selection={false}
          onRowClick={(event, dataImport) => {
            if (!dataImport) return;
            const newParams = {
              ...params,
              dataImportId: dataImport.id,
            };
            history.push(DataImportViewRoute.generate(newParams));
          }}
          pagination={pagination}
        />
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  tableContainer: {
    backgroundColor: theme.customColors.white,
    border: `1px solid ${theme.customColors.sectionBorder}`,
    borderRadius: `0 0 ${theme.typography.pxToRem(
      5
    )} ${theme.typography.pxToRem(5)}`,
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
  accountCell: {
    display: "flex",
    alignItems: "center",
  },
  header: {
    marginBottom: theme.spacing(),
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(2),
  },
  container: {
    padding: 0,
  },
}));
