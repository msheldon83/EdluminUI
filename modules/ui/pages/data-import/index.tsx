import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { PageTitle } from "ui/components/page-title";
import { DataImportRoute, DataImportViewRoute } from "ui/routes/data-import";
import { useRouteParams } from "ui/routes/definition";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { usePagedQueryBundle, useQueryBundle } from "graphql/hooks";
import { GetDataImports } from "./graphql/get-data-imports.gen";
import { Table } from "ui/components/table";
import { Column } from "material-table";
import { compact } from "lodash-es";
import { format } from "date-fns";
import { getDisplayName } from "ui/components/enumHelpers";

export const DataImportPage: React.FC<{}> = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const params = useRouteParams(DataImportRoute);

  const [getImports, pagination] = usePagedQueryBundle(
    GetDataImports,
    r => r.dataImport?.paged?.totalCount,
    {
      variables: {
        orgId: params.organizationId,
      },
    }
  );

  const dataImports =
    getImports.state === "DONE"
      ? compact(getImports.data.dataImport?.paged?.results)
      : [];

  const columns: Column<GetDataImports.Results>[] = [
    { title: t("Id"), field: "id", sorting: false },
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
        return getDisplayName(
          "dataImportType",
          data.importOptions.dataImportTypeId,
          t
        );
      },
      sorting: false,
    },
    {
      title: t("Action"),
      render: data => {
        if (data.importOptions.parseOnly) {
          return t("Parse only");
        } else if (data.importOptions.validateOnly) {
          return t("Validate only");
        } else {
          return t("Import");
        }
      },
      sorting: false,
    },
  ];

  const dataImportCount = pagination.totalCount;

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
      </Grid>
      <div className={classes.tableContainer}>
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
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  tableContainer: {
    backgroundColor: theme.customColors.white,
    border: `1px solid ${theme.customColors.sectionBorder}`,
    borderTopWidth: 0,
    borderRadius: `0 0 ${theme.typography.pxToRem(
      5
    )} ${theme.typography.pxToRem(5)}`,
    padding: theme.spacing(3),
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
}));
