import * as React from "react";
import { makeStyles, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import GetAppIcon from "@material-ui/icons/GetApp";
import { Column } from "material-table";

type Props<T extends object> = {
  data: Array<T>;
  fileName: string;
  className?: string;
};

export function CsvExporter<T extends object>(props: Props<T>) {
  const classes = useStyles();
  const { t } = useTranslation();

  const run = () => {
    if (props.data.length === 0 || props.data === undefined) return;

    let csv = convertArrayOfObjectsToCSV();
    if (csv == null) return;
    csv = "data:text/csv;charset=utf-8," + csv;

    const data = encodeURI(csv);

    const link = document.createElement("a");
    link.setAttribute("href", data);
    link.setAttribute("download", props.fileName + ".csv");
    link.click();
  };

  function convertArrayOfObjectsToCSV() {
    const columnDelimiter = ",";
    const lineDelimiter = "\n";

    const keys = Object.keys(props.data[0]);

    let result = "";
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    props.data.map((e: any) => {
      let ctr = 0;
      keys.map(function(key) {
        if (ctr > 0) result += columnDelimiter;

        result += e[key];
        ctr++;
      });
      result += lineDelimiter;
    });

    return result;
  }

  return (
    <Button
      onClick={() => run()}
      variant="outlined"
      className={props.className}
      endIcon={<GetAppIcon />}
    >
      {t("Export Data")}
    </Button>
  );
}

const useStyles = makeStyles(theme => ({
  button: {
    paddingTop: 0,
    paddingBottom: 0,
    "&:hover": {
      backgroundColor: "inherit",
    },
  },
}));
