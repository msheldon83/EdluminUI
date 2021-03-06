import { makeStyles } from "@material-ui/core";
import { OrgUserRole } from "graphql/server-types.gen";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { EmployeeFilters } from "./employee-filters";
import { AdminFilters } from "./admin-filters";
import { FilterQueryParams } from "./filter-params";
import { ReplacementEmployeeFilters } from "./replacement-employee-filters";
import { useTranslation } from "react-i18next";

type Props = {};

export const FiltersByRole: React.FC<Props> = props => {
  const [filters] = useQueryParamIso(FilterQueryParams);
  const { t } = useTranslation();

  switch (filters.roleFilter) {
    case OrgUserRole.Employee:
      return (
        <EmployeeFilters
          {...filters}
          locationLabel={t("Locations")}
          positionTypeLabel={t("Position type")}
        />
      );
    case OrgUserRole.ReplacementEmployee:
      return <ReplacementEmployeeFilters {...filters} />;
    case OrgUserRole.Administrator:
      return (
        <AdminFilters
          {...filters}
          locationLabel={t("Manages locations")}
          positionTypeLabel={t("Manages position type")}
        />
      );
    case null:
    default:
      return <></>;
  }
};

export const useFilterStyles = makeStyles(theme => ({
  label: {
    color: theme.customColors.eduBlack,
    fontSize: theme.typography.pxToRem(14),
    marginBottom: theme.spacing(0.4),
    lineHeight: theme.typography.pxToRem(21),
  },
  textField: {
    marginTop: theme.spacing(2),
  },
}));
