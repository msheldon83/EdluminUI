import { Button, Theme } from "@material-ui/core";
import {
  PermissionEnum,
  VacancyQualification,
  VacancyAvailability,
} from "graphql/server-types.gen";
import { TFunction } from "i18next";
import * as React from "react";
import { TableColumn } from "ui/components/table";
import { AvailableIcon } from "./icons/available-icon";
import { FavoriteIcon } from "./icons/favorite-icon";
import { QualifiedIcon } from "./icons/qualified-icon";
import { VisibleIcon } from "./icons/visible-icon";
import { ValidationChecks } from "./";

export type AssignSubColumn = {
  employeeId: string;
  firstName: string;
  lastName: string;
  primaryPhone?: string | null;
  email?: string | null | undefined;
  qualified: VacancyQualification;
  available: VacancyAvailability;
  unavailableToWork: boolean;
  isAvailableToSubWhenSearching: boolean;
  availableToSubWhenSearchingAtUtc?: string | null;
  availableToSubWhenSearchingAtLocal?: string | null;
  isEmployeeFavorite: boolean;
  isLocationPositionTypeFavorite: boolean;
  selectable: boolean;
  payCodeId?: string | null;
  isQualified: boolean;
  isRejected: boolean;
  isMinorJobConflict: boolean;
  excludedSub: boolean;
  notIncluded: boolean;
};

export const getAssignSubColumns = (
  tableData: AssignSubColumn[],
  isAdmin: boolean,
  selectTitle: string,
  assignReplacementEmployee: (
    replacementEmployeeId: string,
    replacementEmployeeFirstName: string,
    replacementEmployeeLastName: string,
    replacementEmployeeEmail: string | undefined,
    payCodeId: string | undefined,
    validationChecks: ValidationChecks
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

  // Only Admins see the Qualified. Available, and Visible columns
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
        return (
          <AvailableIcon
            available={data.available}
            excludedSub={data.excludedSub}
            unavailableToWork={data.unavailableToWork}
          />
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
    columns.push({
      title: t("Visible"),
      field: "visible",
      render: (data: typeof tableData[0]) => {
        return (
          <VisibleIcon
            isAvailableToSubWhenSearching={data.isAvailableToSubWhenSearching}
            availableToSubWhenSearchingAtUtc={
              data.availableToSubWhenSearchingAtUtc
            }
            availableToSubWhenSearchingAtLocal={
              data.availableToSubWhenSearchingAtLocal
            }
          />
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
          const validationChecks: ValidationChecks = {
            isQualified: data.isQualified,
            isRejected: data.isRejected,
            isMinorJobConflict: data.isMinorJobConflict,
            excludedSub: data.excludedSub,
            notIncluded: data.notIncluded,
            unavailableToWork: data.unavailableToWork,
          };
          await assignReplacementEmployee(
            data.employeeId,
            data.firstName,
            data.lastName,
            data.email ? data.email : undefined,
            data.payCodeId ? data.payCodeId : undefined,
            validationChecks
          );
        }}
      >
        {selectTitle}
      </Button>
    ),
  });

  return columns;
};
