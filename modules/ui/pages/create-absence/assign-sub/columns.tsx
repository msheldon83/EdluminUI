import * as React from "react";
import { Button, Theme } from "@material-ui/core";
import { TFunction } from "i18next";
import { FavoriteIcon } from "./icons/favorite-icon";
import { QualifiedIcon } from "./icons/qualified-icon";
import { AvailableIcon } from "./icons/available-icon";
import { VisibleIcon } from "./icons/visible-icon";
import { PermissionEnum } from "graphql/server-types.gen";
import { TableColumn } from "ui/components/table";

export const getAssignSubColumns = (
  tableData: any[],
  isAdmin: boolean,
  selectTitle: string,
  selectReplacementEmployee: (
    replacementEmployeeId: number,
    name: string,
    payCodeId: string | undefined
  ) => Promise<void>,
  isMobile: boolean,
  theme: Theme,
  classes: any,
  t: TFunction
) => {
  //TODO: Custom sort handling for Star column, Qualified, Available, Visible

  const columns: TableColumn<typeof tableData[0]>[] = [
    {
      title: isMobile ? "" : t("Favorite"),
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
      title: t("First name"),
      field: "firstName",
    },
    {
      title: t("Last name"),
      field: "lastName",
    },
  ];
  if (!isMobile) {
    columns.push({
      title: t("Primary phone"),
      field: "primaryPhone",
      permissions: [PermissionEnum.SubstituteViewPhone],
    });
  }

  // Only Admins see the Qualified and Available columns
  if (isAdmin && !isMobile) {
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

  if (!isMobile) {
    columns.push({
      title: t("Visible"),
      field: "visible",
      render: (data: typeof tableData[0]) => {
        return (
          <VisibleIcon visible={data.visible} visibleOn={data.visibleOn} />
        );
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
    title: "",
    field: "actions",
    sorting: false,
    permissions: [PermissionEnum.AbsVacAssign],
    render: (data: typeof tableData[0]) => (
      <Button
        variant="outlined"
        disabled={!data.selectable}
        className={classes.selectButton}
        onClick={async () => {
          await selectReplacementEmployee(
            data.employeeId,
            `${data.firstName} ${data.lastName}`,
            data.payCodeId ? data.payCodeId.toString() : undefined
          );
        }}
      >
        {selectTitle}
      </Button>
    ),
  });

  return columns;
};
