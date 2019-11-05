import { makeStyles } from "@material-ui/core";
import { OrgUserRole } from "graphql/server-types.gen";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { AdministratorFilters } from "./administrator-filters";
import { EmployeeFilters } from "./employee-filters";
import { FilterQueryParams } from "./filter-params";
import { ReplacementEmployeeFilters } from "./replacement-employee-filters";

type Props = {};

export const FiltersByRole: React.FC<Props> = props => {
  const [filters] = useQueryParamIso(FilterQueryParams);

  switch (filters.roleFilter) {
    case OrgUserRole.Employee:
      return <EmployeeFilters {...filters} />;
    case OrgUserRole.ReplacementEmployee:
      return <ReplacementEmployeeFilters {...filters} />;
    case OrgUserRole.Administrator:
      return <AdministratorFilters {...filters} />;
    case null:
    default:
      return <></>;
  }
};

export const useFilterStyles = makeStyles(theme => ({
  label: {
    // color: theme.customColors.black,
    fontWeight: 500,
    marginBottom: theme.typography.pxToRem(16),
  },
  textField: {
    marginTop: theme.spacing(2),
  },
}));
