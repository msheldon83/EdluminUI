import * as React from "react";
import { useEffect } from "react";
import clsx from "clsx";
import {
  makeStyles,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  Typography,
} from "@material-ui/core";
import MaterialTable, {
  MTableBodyRow,
  MTableCell,
  MTableToolbar,
  MTableActions,
} from "material-table";
import { useTheme } from "@material-ui/core/styles";
import { MaterialTableProps } from "material-table";
import { forwardRef } from "react";
import { Icons } from "material-table";
import AddBox from "@material-ui/icons/AddBox";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import { useTranslation } from "react-i18next";

export type TableProps<T extends object> = {
  title: string;
  data: Array<T>;
  selection?: boolean;
  paging?: boolean;
  onRowClick?: (event?: React.MouseEvent, rowData?: T) => void;
  onEdit?: Function;
  isEditable?: boolean;
  /**
   * @deprecated This is temporary functionality, we're going to create
   * a new filter component for tables that will allow Active filtering
   * and then this should be removed
   */
  showIncludeExpired?: boolean;
  /**
   * @deprecated This is temporary functionality, we're going to create
   * a new filter component for tables that will allow Active filtering
   * and then this should be removed
   */
  onIncludeExpiredChange?: (checked: boolean) => void;
  expiredRowCheck?: (rowData: T) => boolean;
  style?: React.CSSProperties;
  backgroundFillForAlternatingRows?: boolean;
} & Pick<MaterialTableProps<T>, "options" | "columns" | "actions" | "editable">;

/* cf 2019-10-22 - this lint warning isn't helpful here, as these are icons: */
/* eslint-disable react/display-name */

const tableIcons: Icons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

export function Table<T extends object>(props: TableProps<T>) {
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [includeExpired, setIncludeExpired] = React.useState(false);
  const [data, setData] = React.useState(props.data);

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  const allColumns: MaterialTableProps<T>["columns"] = props.columns;
  if (props.onEdit) {
    allColumns.push({
      field: "actions",
      title: "",
      sorting: false,
      render: (rowData: T) => {
        const editOption = () => {
          return (
            <Edit
              className={classes.action}
              onClick={() => {
                props.onEdit!(rowData);
              }}
            />
          );
        };
        return editOption();
      },
    });
  }

  const tableIsEditable = props.isEditable;
  const showIncludeExpiredSetting = props.showIncludeExpired;
  const onIncludeExpiredChangeFunc = props.onIncludeExpiredChange;
  const expiredRowCheckFunc = props.expiredRowCheck;
  const styleAlternatingRows = props.backgroundFillForAlternatingRows;

  const CheckForEditableAndIncludeExpiredAndReturnDisplay = (props: any) => {
    if (tableIsEditable) {
      return (
        <>
          <MTableToolbar {...props} search={false} />
        </>
      );
    } else {
      return (
        <>
          <div className={classes.tableTitle}>{props.title}</div>
          {showIncludeExpiredSetting && (
            <Grid container justify="flex-end">
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeExpired}
                      onChange={async e => {
                        setIncludeExpired(e.target.checked);
                        if (onIncludeExpiredChangeFunc) {
                          onIncludeExpiredChangeFunc(e.target.checked);
                        }
                      }}
                      value={includeExpired}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="h6">
                      {t("Include inactive")}
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
          )}
        </>
      );
    }
  };

  return (
    <MaterialTable
      icons={tableIcons}
      title={props.title}
      columns={allColumns}
      data={data}
      editable={props.editable}
      onRowClick={props.onRowClick}
      options={{
        addRowPosition: "first",
        search: false,
        selection: props.selection,
        paging: props.paging,
        pageSize: 10,
        pageSizeOptions: [10, 25, 50, 100],
        headerStyle: {
          color: theme.customColors.darkGray,
          fontSize: theme.typography.pxToRem(15),
          fontWeight: 600,
          letterSpacing: theme.typography.pxToRem(0.25),
          lineHeight: theme.typography.pxToRem(24),
        },
        rowStyle: {
          color: theme.customColors.darkGray,
        },
        ...props.options,
      }}
      style={props.style}
      actions={props.actions}
      components={{
        Container: props => <div className={classes.container} {...props} />,
        Row: props => {
          const classNames = clsx({
            [classes.inactiveRow]:
              expiredRowCheckFunc && expiredRowCheckFunc(props.data),
            [classes.tableRow]: true,
          });
          return <MTableBodyRow className={classNames} {...props} />;
        },
        Cell: props => <MTableCell {...props} className={classes.cell} />,
        Toolbar: props => {
          {
            return CheckForEditableAndIncludeExpiredAndReturnDisplay({
              ...props,
            });
          }
        },
      }}
    />
  );
}

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: theme.customColors.white,
  },
  tableTitle: {
    fontSize: theme.typography.pxToRem(24),
    lineHeight: theme.typography.pxToRem(36),
    paddingBottom: theme.spacing(1),
  },
  action: {
    cursor: "pointer",
  },
  inactiveRow: {
    color: theme.customColors.gray,
  },
  tableRow: {
    borderTop: `1px solid ${theme.customColors.sectionBorder}`,

    "&:nth-child(even)": {
      background: theme.customColors.lightGray,
    },
  },
  cell: {
    borderBottom: 0,
    paddingBottom: theme.spacing(1.7),
    paddingTop: theme.spacing(1.7),
  },
}));
