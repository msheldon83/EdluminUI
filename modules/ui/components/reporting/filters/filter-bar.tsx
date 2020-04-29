import * as React from "react";
import { ReportDefinition } from "../types";

type Props = {
  reportDefinition: ReportDefinition;
  filterKeysOverride?: string[];
};

export const FilterBar: React.FC<Props> = props => {
  // Get all possible filterable data fields: FilterType

  // If we have filterKeysOverride, then filter that list to the matching ones

  // For the Custom ones, look at the FilterTypeDefinition for info on how to build that filter
  // These are going to be your Location or Employee dropdowns

  return <div>Filters</div>;
};
