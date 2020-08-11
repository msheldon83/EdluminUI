import * as React from "react";
import { useEffect, useMemo } from "react";
import clsx from "clsx";
import {
  makeStyles,
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
} from "@material-ui/core";
import MaterialTable, {
  MTableBodyRow,
  MTableCell,
  MTableToolbar,
  Column,
  Action,
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
import { PermissionEnum } from "graphql/server-types.gen";
import { useMyUserAccess } from "reference-data/my-user-access";
import { can } from "helpers/permissions";
import { useOrganizationId } from "core/org-context";
import { PaginationControls } from "ui/components/pagination-controls";
import { PaginationInfo } from "graphql/hooks";
import { useIsMobile } from "hooks";
import { useRole } from "core/role-context";

export type TableProps<T extends object> = {
  title?: string;
  data: Array<T>;
  columns: TableColumn<T>[];
  selection?: boolean;
  selectionPermissions?: PermissionEnum[];
  actions?: TableAction<T>[];
  onRowClick?: (event?: React.MouseEvent, rowData?: T) => void;
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
  pagination?: PaginationInfo;
} & Pick<MaterialTableProps<T>, "options" | "editable">;

export type TableColumn<T extends object> = {
  permissions?: PermissionEnum[];
} & Column<T>;

type TableAction<T extends object> = {
  permissions?: PermissionEnum[];
} & Action<T>;

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
  const overrideStyles = rootStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const userAccess = useMyUserAccess();
  const organizationId = useOrganizationId();
  const contextRole = useRole();
  const [includeExpired, setIncludeExpired] = React.useState(false);
  const [data, setData] = React.useState(props.data);
  const pagination = props.pagination;
  const isMobile = useIsMobile();

  useEffect(() => {
    setData(props.data);
  }, [props.data]);

  // Handle any permission checks to determine if we need to hide any columns
  const allColumns: TableColumn<T>[] = useMemo(() => {
    return props.columns.map(c => {
      if (!c.permissions || c.hidden) {
        return c;
      }

      return {
        ...c,
        hidden: !can(
          c.permissions,
          userAccess?.permissionsByOrg ?? [],
          userAccess?.isSysAdmin ?? false,
          organizationId,
          contextRole ?? undefined
        ),
      };
    });
  }, [props.columns, organizationId, userAccess, contextRole]);

  // Handle permission checks for selection if specified
  const selection = useMemo(() => {
    if (!props.selection) {
      return false;
    }
    if (!props.selectionPermissions) {
      return props.selection;
    }

    return can(
      props.selectionPermissions,
      userAccess?.permissionsByOrg ?? [],
      userAccess?.isSysAdmin ?? false,
      organizationId,
      contextRole ?? undefined
    );
  }, [
    props.selection,
    props.selectionPermissions,
    organizationId,
    userAccess,
    contextRole,
  ]);

  // Handle any permission checks to determine if we need to hide any columns
  const allActions: TableAction<T>[] | undefined = useMemo(() => {
    if (!props.actions) {
      return undefined;
    }

    return props.actions.map(a => {
      if (!a.permissions) {
        return a;
      }

      return {
        ...a,
        hidden: !can(
          a.permissions,
          userAccess?.permissionsByOrg ?? [],
          userAccess?.isSysAdmin ?? false,
          organizationId,
          contextRole ?? undefined
        ),
      };
    });
  }, [props.actions, organizationId, userAccess, contextRole]);
  const anyActionsVisible: boolean = useMemo(() => {
    return !!allActions?.find(a => !a.hidden);
  }, [allActions]);

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
          {pagination && !isMobile && (
            <PaginationControls pagination={pagination} />
          )}
        </>
      );
    } else {
      return (
        <>
          <MTableToolbar {...props} />
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
          {pagination && !isMobile && (
            <PaginationControls pagination={pagination} />
          )}
        </>
      );
    }
  };
  return (
    <>
      <MaterialTable
        icons={tableIcons}
        title={
          props.title ? (
            <div className={classes.tableTitle}>{props.title}</div>
          ) : (
            ""
          )
        }
        columns={allColumns}
        data={data}
        editable={props.editable}
        onRowClick={props.onRowClick}
        options={{
          addRowPosition: "first",
          selection: selection,
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
          search: false,
          paging: false,
          ...props.options,
        }}
        style={props.style}
        actions={anyActionsVisible ? allActions : undefined}
        components={{
          Container: props => <div className={classes.container} {...props} />,
          Row: props => {
            const classNames = clsx({
              [classes.inactiveRow]:
                expiredRowCheckFunc && expiredRowCheckFunc(props.data),
              [classes.tableRow]: true,
            });
            return (
              <MTableBodyRow
                className={classNames}
                {...props}
                classes={{ root: overrideStyles.root }}
              />
            );
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
      {pagination && <PaginationControls pagination={pagination} />}
    </>
  );
}

const rootStyles = makeStyles(theme => ({
  root: {
    opacity: `${1.0} !important`,
  },
}));

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
    color: `${theme.customColors.gray} !important`,
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
  opacity: {
    opacity: 1.0,
  },
}));
