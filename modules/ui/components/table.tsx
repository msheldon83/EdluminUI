import * as React from "react";
import { makeStyles } from "@material-ui/core";
import MaterialTable from "material-table";

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

type Props = {
  title: string;
  columns: Array<Column>;
  data: Array<any>;
  selection?: boolean;
  paging?: boolean;
  onRowClick?: (event?: React.MouseEvent, rowData?: any) => void;
  onEdit?: Function;
};

type Column = {
  title: string;
  field: string;
  sorting?: boolean;
  render?: any;
};

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

export const Table: React.FC<Props> = props => {
  const classes = useStyles();

  const allColumns: Array<Column> = props.columns;
  if (props.onEdit) {
    allColumns.push({
      field: "actions",
      title: "",
      sorting: false,
      render: (rowData: object) => {
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

  return (
    <MaterialTable
      icons={tableIcons}
      title={props.title}
      columns={allColumns}
      data={props.data}
      onRowClick={props.onRowClick}
      options={{
        search: false,
        selection: props.selection,
        paging: props.paging,
        pageSize: 10,
        pageSizeOptions: [10, 25, 50, 100],
      }}
    />
  );
};

const useStyles = makeStyles(theme => ({
  action: {
    cursor: "pointer",
  },
}));
