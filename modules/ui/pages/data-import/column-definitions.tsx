import * as React from "react";
import { useState, useMemo } from "react";
import { Grid, makeStyles, Divider } from "@material-ui/core";
import { PageTitle } from "ui/components/page-title";
import { DataImportRoute } from "ui/routes/data-import";
import { useQueryBundle } from "graphql/hooks";
import { DataImportType } from "graphql/server-types.gen";
import { Section } from "ui/components/section";
import { useRouteParams } from "ui/routes/definition";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { ImportTypeFilter } from "ui/components/data-import/import-type-filter";
import { GetDataImportColumnDefinitions } from "./graphql/get-data-import-column-definitions.gen";
import { Table } from "ui/components/table";
import { Column } from "material-table";
import { compact } from "lodash-es";
import { CSVLink } from "react-csv";

export const DataImportColumnDefinitions: React.FC<{}> = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const params = useRouteParams(DataImportRoute);

  const [selectedTypeId, setSelectedTypeId] = useState<
    DataImportType | undefined
  >(undefined);

  const getColumnDefinitions = useQueryBundle(GetDataImportColumnDefinitions, {
    variables: {
      dataImportType: selectedTypeId,
    },
    skip: !selectedTypeId,
  });

  const columnDefinitions = useMemo(() => {
    const columns =
      getColumnDefinitions.state === "DONE"
        ? compact(
            getColumnDefinitions.data.dataImport?.dataImportTypeColumnDefinition
          )
        : [];
    const rootIndex = columns.findIndex(x => x.propertyName === "root");
    if (rootIndex > -1) {
      columns.splice(rootIndex, 1);
    }
    return columns;
  }, [getColumnDefinitions]);

  const columns: Column<
    GetDataImportColumnDefinitions.DataImportTypeColumnDefinition
  >[] = [
    { title: t("Property name"), field: "propertyName" },
    {
      title: t("Required"),
      render: data => {
        if (data.isRequired) return t("Yes");
      },
    },
    {
      title: t("Is parent"),
      render: data => {
        if (data.isParent) return t("Yes");
      },
    },
    {
      title: t("Grouping indicator"),
      render: data => {
        if (data.isGroupingIndicator) return t("Yes");
      },
    },
    {
      title: t("Alternate names"),
      render: data =>
        data.alternateNames?.filter(x => x !== data.propertyName).join(", "),
    },
  ];

  const columnNames = columnDefinitions.map(x => x.propertyName);

  return (
    <>
      <Link to={DataImportRoute.generate(params)} className={classes.link}>
        {t("Return to all data imports")}
      </Link>
      <Grid
        container
        alignItems="flex-start"
        justify="space-between"
        spacing={2}
      >
        <Grid item>
          <PageTitle title={t("Data import column definitions")} />
        </Grid>
      </Grid>
      <Section>
        <Grid container alignItems="center" justify="space-between">
          <Grid item xs={3}>
            <ImportTypeFilter
              selectedTypeId={selectedTypeId}
              setSelectedTypeId={setSelectedTypeId}
              includeAllOption={false}
            />
          </Grid>
          {selectedTypeId && columnNames.length > 0 && (
            <Grid item xs={3}>
              <CSVLink
                headers={columnNames}
                data={""}
                filename={`${selectedTypeId?.toString()}_template.csv`}
                target="_blank"
                className={classes.link}
              >
                {t("Download template")}
              </CSVLink>
            </Grid>
          )}
        </Grid>
        <Divider className={classes.divider} />
        {selectedTypeId ? (
          <Table columns={columns} data={columnDefinitions} selection={false} />
        ) : (
          <div className={classes.text}>{t("Select a data import type")}</div>
        )}
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  divider: {
    marginTop: theme.spacing(2),
  },
  link: {
    color: theme.customColors.blue,
    "&:visited": {
      color: theme.customColors.blue,
    },
  },
  text: {
    marginTop: theme.spacing(2),
    fontSize: theme.typography.pxToRem(24),
  },
}));
