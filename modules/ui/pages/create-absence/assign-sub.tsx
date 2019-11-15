import * as React from "react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePagedQueryBundle, useMutationBundle } from "graphql/hooks";
import { makeStyles, useTheme } from "@material-ui/styles";
import { useScreenSize } from "hooks";
import { GetReplacementEmployeesForVacancy } from "ui/pages/create-absence/graphql/get-replacement-employees.gen";
import { Section } from "ui/components/section";
import { compact } from "lodash-es";
import { Table } from "ui/components/table";
import { PageTitle } from "ui/components/page-title";
import { IconButton, Typography, Divider, Button } from "@material-ui/core";
import {
  AccountCircleOutlined,
  Star,
  StarBorder,
  Check,
  Cancel,
  Visibility,
  VisibilityOff,
  AccessTime,
} from "@material-ui/icons";
import { Column } from "material-table";
import { Qualified, Available } from "graphql/server-types.gen";

type Props = {
  orgId: string;
  vacancyId?: string | null | undefined;
  isEmployee: boolean;
  employeeName: string;
};

const getQualifiedIcon = (qualified: Qualified) => {
  switch (qualified) {
    case Qualified.Fully:
      return <Check />;
    // TODO: This has to be distinguished from Fully with a different icon
    case Qualified.Minimally:
      return <Check />;
    case Qualified.NotQualified:
      return <Cancel />;
  }
};

const getAvailableIcon = (available: Available) => {
  switch (available) {
    case Available.Yes:
      return <Check />;
    // TODO: This has to be distinguished from YES with a different icon
    case Available.MinorConflict:
      return <Check />;
    case Available.No:
      return <Cancel />;
  }
};

const getVisibleIcon = (
  visible: boolean,
  visibleOn?: Date | null | undefined
) => {
  if (visible) {
    return <Visibility />;
  }

  if (!visibleOn) {
    return <VisibilityOff />;
  }

  // TODO: Add a tooltip to show when this will be visible to the Sub
  return <AccessTime />;
};

export const AssignSub: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useScreenSize() === "mobile";

  const [
    getReplacementEmployeesForVacancyQuery,
    pagination,
  ] = usePagedQueryBundle(
    GetReplacementEmployeesForVacancy,
    r => r.absence?.replacementEmployeesForVacancy?.totalCount,
    {
      variables: { orgId: props.orgId, vacancyId: props.vacancyId },
    }
  );

  let replacementEmployees: GetReplacementEmployeesForVacancy.Results[] = [];
  if (
    getReplacementEmployeesForVacancyQuery.state === "DONE" ||
    getReplacementEmployeesForVacancyQuery.state === "UPDATING"
  ) {
    const qResults: GetReplacementEmployeesForVacancy.Results[] = compact(
      getReplacementEmployeesForVacancyQuery.data?.absence
        ?.replacementEmployeesForVacancy?.results
    );
    if (qResults) replacementEmployees = qResults;
  }
  const tableData = useMemo(() => {
    return replacementEmployees.map(r => ({
      employeeId: r.employee.id,
      firstName: r.employee.firstName,
      lastName: r.employee.lastName,
      primaryPhone: "123-134-3456",
      qualified: r.qualified,
      available: r.available,
      visible: r.visible,
      visibleOn: r.visibleOnLocal,
      selectable: true,
    }));
  }, [replacementEmployees]);

  if (
    getReplacementEmployeesForVacancyQuery.state === "LOADING" ||
    !getReplacementEmployeesForVacancyQuery.data.absence
      ?.replacementEmployeesForVacancy?.results
  ) {
    return <></>;
  }

  //TODO: Custom sort handling for Star column, Qualified, Available, Visible

  const columns: Column<typeof tableData[0]>[] = [
    {
      cellStyle: {
        width: isMobile
          ? theme.typography.pxToRem(40)
          : theme.typography.pxToRem(70),
      },
      render: () => <Star />, // eslint-disable-line
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
    {
      title: t("Qualified"),
      field: "qualified",
      render: (data: typeof tableData[0]) => getQualifiedIcon(data.qualified),
      cellStyle: {
        textAlign: "center",
      },
      headerStyle: {
        textAlign: "center",
      },
      sorting: false,
    },
    {
      title: t("Available"),
      field: "available",
      render: (data: typeof tableData[0]) => getAvailableIcon(data.available),
      cellStyle: {
        textAlign: "center",
      },
      headerStyle: {
        textAlign: "center",
      },
      sorting: false,
    },
    {
      title: t("Visible"),
      field: "visible",
      render: (data: typeof tableData[0]) =>
        getVisibleIcon(data.visible, data.visibleOn),
      cellStyle: {
        textAlign: "center",
      },
      headerStyle: {
        textAlign: "center",
      },
      sorting: false,
    },
    {
      title: "",
      field: "actions",
      sorting: false,
      render: (data: typeof tableData[0]) => (
        <Button
          variant="contained"
          disabled={!data.selectable}
          onClick={() => {
            console.log("Selecting Employee Id", data.employeeId);
          }}
        >
          {t("Select")}
        </Button>
      ),
    },
  ];

  const replacementEmployeeCount = pagination.totalCount;
  const pageHeader = props.vacancyId
    ? props.isEmployee
      ? t("Assigning substitute")
      : t("Assigning substitute for")
    : props.isEmployee
    ? t("Prearranging substitute")
    : t("Prearranging substitute for");

  return (
    <>
      <Typography variant="h5">{pageHeader}</Typography>
      {!props.isEmployee && (
        <Typography variant="h1">{props.employeeName}</Typography>
      )}
      <Section>
        <div>Vacancy Details go here</div>
        <Divider />
        <div>Filters go here</div>
        <Divider />
        <Table
          title={`${replacementEmployeeCount} ${
            replacementEmployeeCount === 1 ? t("substitute") : t("substitutes")
          }`}
          columns={columns}
          data={tableData}
          selection={false}
          paging={true}
        />
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  subtitle: {
    fontSize: theme.typography.pxToRem(24),
  },
  absenceDetails: {
    marginTop: theme.spacing(3),
  },
}));
