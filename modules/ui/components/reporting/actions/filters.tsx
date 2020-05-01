import * as React from "react";
import { DataSourceField, FilterType, FilterField } from "../types";
import {
  FormControlLabel,
  Checkbox,
  Button,
  Popper,
  Fade,
  makeStyles,
} from "@material-ui/core";
import { LocationSelect } from "ui/components/reference-selects/location-select";
import { PositionTypeSelect } from "ui/components/reference-selects/position-type-select";
import { useTranslation } from "react-i18next";
import { FilterList } from "@material-ui/icons";
import { flatMap } from "lodash-es";
import { SelectNew } from "ui/components/form/select-new";

type Props = {
  currentFilters: FilterField[];
  filterableFields: DataSourceField[];
  setFilter: (filterField: FilterField) => void;
};

export const Filters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { currentFilters, filterableFields, setFilter } = props;

  const [filtersAnchor, setFiltersAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const filtersOpen = Boolean(filtersAnchor);
  const filtersId = filtersOpen ? "filters-popper" : undefined;
  const handleShowFilters = (event: React.MouseEvent<HTMLElement>) => {
    setFiltersAnchor(filtersAnchor ? null : event.currentTarget);
  };

  const buttonText =
    currentFilters.length > 0
      ? `${t("Filtered by:")} ${currentFilters.length} ${
          currentFilters.length === 1 ? t("field") : t("fields")
        }`
      : t("Filter");

  return (
    <>
      <Button
        id={filtersId}
        color="inherit"
        startIcon={<FilterList />}
        onClick={handleShowFilters}
        className={classes.actionButton}
      >
        {buttonText}
      </Button>
      <Popper
        transition
        open={filtersOpen}
        anchorEl={filtersAnchor}
        placement="bottom-start"
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <div className={classes.filters}>
              {FilterRow(true, setFilter, currentFilters, filterableFields)}
            </div>
          </Fade>
        )}
      </Popper>
    </>
  );

  // let filters: JSX.Element[] = [];
  // filterFields.forEach(ff => {
  //   switch (ff.field.filterType) {
  //     case FilterType.Boolean:
  //       filters.push(
  //         <FormControlLabel
  //           checked={ff.value ?? false}
  //           control={
  //             <Checkbox
  //               onChange={(e, checked) => setFilterValue(ff.field, checked)}
  //               color="primary"
  //             />
  //           }
  //           label={ff.field.friendlyName}
  //         />
  //       );
  //       break;
  //     case FilterType.Custom:
  //       (ff.field.filterTypeDefinition ?? []).map(ft => {
  //         switch (ft.key) {
  //           case "Location":
  //             filters.push(
  //               <LocationSelect
  //                 orgId={"1038"}
  //                 setSelectedLocationIds={() => {}}
  //                 multiple={true}
  //                 label={ff.field.friendlyName}
  //                 includeAllOption={true}
  //               />
  //             );
  //             break;
  //           case "PositionType":
  //             filters.push(
  //               <PositionTypeSelect
  //                 orgId={"1038"}
  //                 setSelectedPositionTypeIds={() => {}}
  //                 multiple={true}
  //                 label={ff.field.friendlyName}
  //                 includeAllOption={true}
  //               />
  //             );
  //             break;
  //         }
  //       });
  //       break;
  //   }
  // });

  // if (filters.length === 0) {
  //   return null;
  // }

  // return (
  //   <>
  //     {filters.map((f, i) => {
  //       return <React.Fragment key={i}>{f}</React.Fragment>;
  //     })}
  //   </>
  // );
};

const useStyles = makeStyles(theme => ({
  actionButton: {
    cursor: "pointer",
    minWidth: theme.typography.pxToRem(150),
    background: "rgba(5, 0, 57, 0.6)",
    borderRadius: "4px",
    padding: `${theme.typography.pxToRem(14)} ${theme.typography.pxToRem(24)}`,
    color: "#FFFFFF",
    "&:hover": {
      background: "rgba(5, 0, 57, 0.5)",
    },
  },
  filters: {
    width: theme.typography.pxToRem(500),
    minHeight: theme.typography.pxToRem(100),
    background: theme.palette.background.paper,
    border: "1px solid #E5E5E5",
    boxSizing: "border-box",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
    borderRadius: "4px",
  },
}));

const getFilterOptions = (
  currentFilters: FilterField[],
  filterableFields: DataSourceField[]
) => {
  const remainingFields = filterableFields.filter(
    f =>
      !currentFilters.find(
        c => c.field.dataSourceFieldName === f.dataSourceFieldName
      )
  );

  return flatMap(
    remainingFields.map(f => {
      if (!f.filterTypeDefinition) {
        return {
          label: f.friendlyName,
          value: f.dataSourceFieldName,
        };
      }

      return f.filterTypeDefinition.map(ft => {
        return {
          label: ft.friendlyName,
          value: ft.filterDataSourceFieldName,
        };
      });
    })
  );
};

const FilterRow = (
  isFirst: boolean,
  setFilter: (filterField: FilterField) => void,
  currentFilters: FilterField[],
  filterableFields: DataSourceField[]
) => {
  const filterOptions = getFilterOptions(currentFilters, filterableFields);

  return (
    <div>
      <div>X</div>
      <div>Where</div>
      <div>
        <SelectNew
          value={filterOptions[0]}
          options={filterOptions}
          onChange={() => {}}
          multiple={false}
          withResetValue={false}
        />
      </div>
      <div>is</div>
      <div>Special filter here</div>
    </div>
  );
};
