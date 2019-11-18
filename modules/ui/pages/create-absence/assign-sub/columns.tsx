import * as React from "react";
import { Column } from "material-table";
import { classes } from "istanbul-lib-coverage";
import { Button, Theme } from "@material-ui/core";
import { TFunction } from "i18next";
import { FavoriteIcon } from "./icons/favorite-icon";
import { QualifiedIcon } from "./icons/qualified-icon";
import { AvailableIcon } from "./icons/available-icon";
import { VisibleIcon } from "./icons/visible-icon";
import { AccountCircleOutlined } from "@material-ui/icons";

export const getAssignSubColumns = (
  tableData: any[],
  isAdmin: boolean,
  isMobile: boolean,
  theme: Theme,
  classes: any,
  t: TFunction
) => {
  //TODO: Custom sort handling for Star column, Qualified, Available, Visible

  const columns: Column<typeof tableData[0]>[] = [
    {
      title: t("Favorite"),
      cellStyle: {
        width: isMobile
          ? theme.typography.pxToRem(40)
          : theme.typography.pxToRem(70),
        textAlign: "center",
      },
      headerStyle: {
        textAlign: "center",
      },
      render: (data: typeof tableData[0]) => {
        return (
          <FavoriteIcon
            isEmployeeFavorite={data.isEmployeeFavorite}
            isLocationPositionTypeFavorite={data.isLocationPositionTypeFavorite}
          />
        );
      },
      sorting: false,
    },
    {
      cellStyle: {
        width: isMobile
          ? theme.typography.pxToRem(40)
          : theme.typography.pxToRem(70),
      },
      render: () => <AccountCircleOutlined />, // eslint-disable-line
      sorting: false,
    },
    {
      title: t("First name"),
      field: "firstName",
    },
    {
      title: t("Last name"),
      field: "lastName",
    },
    { title: t("Primary phone"), field: "primaryPhone" },
  ];

  // Only Admins see the Qualified and Available columns
  if (isAdmin) {
    columns.push({
      title: t("Qualified"),
      field: "qualified",
      render: (data: typeof tableData[0]) => {
        return <QualifiedIcon qualified={data.qualified} />;
      },
      cellStyle: {
        textAlign: "center",
      },
      headerStyle: {
        textAlign: "center",
      },
      sorting: false,
    });
    columns.push({
      title: t("Available"),
      field: "available",
      render: (data: typeof tableData[0]) => {
        return <AvailableIcon available={data.available} />;
      },
      cellStyle: {
        textAlign: "center",
      },
      headerStyle: {
        textAlign: "center",
      },
      sorting: false,
    });
  }

  columns.push({
    title: t("Visible"),
    field: "visible",
    render: (data: typeof tableData[0]) => {
      return <VisibleIcon visible={data.visible} visibleOn={data.visibleOn} />;
    },
    cellStyle: {
      textAlign: "center",
    },
    headerStyle: {
      textAlign: "center",
    },
    sorting: false,
  });
  columns.push({
    title: "",
    field: "actions",
    sorting: false,
    render: (data: typeof tableData[0]) => (
      <Button
        variant="outlined"
        disabled={!data.selectable}
        className={classes.selectButton}
        onClick={() => {
          console.log("Selecting Employee Id", data.employeeId);
        }}
      >
        {t("Select")}
      </Button>
    ),
  });

  return columns;
};
