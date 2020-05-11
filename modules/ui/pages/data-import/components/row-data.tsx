import * as React from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { Maybe } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";

type Props = {
  columnNames: Maybe<string>[];
  possibleColumnNames: string[];
  columns: Maybe<string>[];
  messages?: Maybe<string>[] | null;
};

export const DataImportRowData: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { columnNames, columns, messages, possibleColumnNames } = props;
  return (
    <div>
      <Grid container spacing={1}>
        {messages &&
          messages.length > 0 &&
          messages.map((m, i) => {
            return <div key={i}>{m}</div>;
          })}
        {columns.map((c, i) => {
          const columnName = columnNames[i];
          const columnNotFound =
            possibleColumnNames.find(
              x => x.toLowerCase() === columnName?.toLowerCase()
            ) === undefined;

          return (
            <Grid
              item
              container
              key={i}
              xs={12}
              className={i % 2 == 0 ? classes.nonShadedRow : classes.shadedRow}
            >
              <Grid item xs={4}>
                <div>{columnName}</div>
              </Grid>
              <Grid item xs={6}>
                <div>{c}</div>
              </Grid>
              <Grid item xs={2}>
                {columnNotFound && <div>{t("Unknown column")}</div>}
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
  shadedRow: {
    background: theme.customColors.lightGray,
    border: `1px solid ${theme.customColors.medLightGray}`,
  },
  nonShadedRow: {
    border: `1px solid ${theme.customColors.medLightGray}`,
  },
}));
