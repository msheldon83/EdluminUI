import {
  Button,
  Collapse,
  Grid,
  InputLabel,
  makeStyles,
  TextField,
} from "@material-ui/core";
import FilterListIcon from "@material-ui/icons/FilterList";
import {
  VacancyAvailability,
  VacancyQualification,
} from "graphql/server-types.gen";
import { not } from "helpers";
import { useDeferredState, useIsMobile } from "hooks";
import { TFunction } from "i18next";
import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { OptionTypeBase } from "react-select";
import { Select, OptionType } from "ui/components/form/select";
import { FilterListButton } from "ui/components/filter-list-button";

type Props = {
  showQualifiedAndAvailable: boolean;
  setSearch: (filters: ReplacementEmployeeFilters) => void;
};

export type ReplacementEmployeeFilters = {
  name?: string;
  qualified?: VacancyQualification[];
  available?: VacancyAvailability[];
  favoritesOnly: boolean;
};

export const AssignSubFilters: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const qualifiedOptionsHandler = new QualifiedOptions(t);
  const qualifiedOptionsMap = qualifiedOptionsHandler.buildQualifiedOptionsMap();
  const qualifiedOptions = qualifiedOptionsHandler.getOptionsForDropdown();
  const availableOptionsHandler = new AvailableOptions(t, true);
  const availableOptionsMap = availableOptionsHandler.buildAvailableOptionsMap();
  const availableOptions = availableOptionsHandler.getOptionsForDropdown();
  const showOptions = [
    { value: "true", label: t("Favorites only") },
    { value: "false", label: t("Everyone") },
  ];

  const [searchFilter, updateSearch] = React.useState<
    ReplacementEmployeeFilters
  >({
    qualified: qualifiedOptionsMap.find(q => q.isDefault)?.search,
    available: availableOptionsMap.find(a => a.isDefault)?.search,
    favoritesOnly: false,
  });

  const [name, pendingName, setPendingName] = useDeferredState(
    searchFilter.name,
    200
  );
  useEffect(() => {
    if (name !== searchFilter.name) {
      setPendingName(name);
    }
  }, [searchFilter.name]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (name !== searchFilter.name) {
      updateSearch({
        ...searchFilter,
        name: name,
      });
    }
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    props.setSearch(searchFilter);
  }, [searchFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const [filtersExpandedOnMobile, setFiltersExpandedOnMobile] = useState(false);
  const isMobile = useIsMobile();
  const toggleFilters = React.useCallback(
    () => setFiltersExpandedOnMobile(not),
    [setFiltersExpandedOnMobile]
  );

  return (
    <Grid container spacing={2}>
      {isMobile && (
        <Grid item xs={12} container justify="flex-end">
          <Grid item>
            <FilterListButton onClick={toggleFilters} />
          </Grid>
        </Grid>
      )}
      <Grid item xs={12}>
        <Collapse in={!isMobile || filtersExpandedOnMobile}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <InputLabel className={classes.label}>{t("Name")}</InputLabel>
              <TextField
                variant="outlined"
                name={"name"}
                value={pendingName ?? ""}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  if (!event.target.value || !event.target.value.length) {
                    setPendingName(undefined);
                  } else {
                    setPendingName(event.target.value);
                  }
                }}
                placeholder={t("Search for last name")}
                fullWidth
              />
            </Grid>
            {props.showQualifiedAndAvailable && (
              <>
                <Grid item xs={12} md={2}>
                  <InputLabel className={classes.label}>
                    {t("Qualified")}
                  </InputLabel>
                  <Select
                    value={
                      searchFilter?.name
                        ? undefined
                        : qualifiedOptions.find(o => {
                            const optionsMap = qualifiedOptionsMap.find(
                              m =>
                                JSON.stringify(m.search) ==
                                JSON.stringify(searchFilter?.qualified)
                            );
                            return o.value === optionsMap?.optionValue;
                          })
                    }
                    disabled={!!searchFilter?.name}
                    multiple={false}
                    withResetValue={false}
                    options={qualifiedOptions}
                    onChange={(e: OptionType) => {
                      let selectedValue: string | null = null;
                      if (e) {
                        if (Array.isArray(e)) {
                          selectedValue = (e as Array<OptionTypeBase>)[0].value;
                        } else {
                          selectedValue = (e as OptionTypeBase).value;
                        }
                      }

                      // Get the appropriate array from the qualifiedOptionsMap
                      const optionsMap = qualifiedOptionsMap.find(
                        m => m.optionValue === selectedValue
                      );

                      if (!optionsMap) {
                        return;
                      }
                      const updatedSearchOptions = {
                        ...searchFilter,
                        qualified: optionsMap.search,
                      };
                      updateSearch(updatedSearchOptions);
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <InputLabel className={classes.label}>
                    {t("Available")}
                  </InputLabel>
                  <Select
                    value={
                      searchFilter?.name
                        ? undefined
                        : availableOptions.find((o: any) => {
                            const optionsMap = availableOptionsMap.find(
                              m =>
                                JSON.stringify(m.search) ==
                                JSON.stringify(searchFilter?.available)
                            );
                            return o.value === optionsMap?.optionValue;
                          })
                    }
                    disabled={!!searchFilter?.name}
                    options={availableOptions}
                    multiple={false}
                    withResetValue={false}
                    onChange={(e: OptionType) => {
                      let selectedValue: string | null = null;
                      if (e) {
                        if (Array.isArray(e)) {
                          selectedValue = (e as Array<OptionTypeBase>)[0].value;
                        } else {
                          selectedValue = (e as OptionTypeBase).value;
                        }
                      }
                      // Get the appropriate array from the availableOptionsMap
                      const optionsMap = availableOptionsMap.find(
                        m => m.optionValue === selectedValue
                      );
                      if (!optionsMap) {
                        return;
                      }
                      const updatedSearchOptions = {
                        ...searchFilter,
                        available: optionsMap.search,
                      };
                      updateSearch(updatedSearchOptions);
                    }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} md={2}>
              <InputLabel className={classes.label}>{t("Show")}</InputLabel>
              <Select
                value={
                  searchFilter?.name
                    ? undefined
                    : showOptions.find(
                        (s: any) =>
                          (searchFilter.favoritesOnly && s.value === "true") ||
                          (!searchFilter.favoritesOnly && s.value === "false")
                      )
                }
                disabled={!!searchFilter?.name}
                options={showOptions}
                multiple={false}
                withResetValue={false}
                onChange={(e: OptionType) => {
                  let selectedValue: string | null = null;
                  if (e) {
                    if (Array.isArray(e)) {
                      selectedValue = (e as Array<OptionTypeBase>)[0].value;
                    } else {
                      selectedValue = (e as OptionTypeBase).value;
                    }
                  }
                  const updatedSearchOptions = {
                    ...searchFilter,
                    favoritesOnly: selectedValue === "true",
                  };
                  updateSearch(updatedSearchOptions);
                }}
              />
            </Grid>
          </Grid>
        </Collapse>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  label: {
    // color: theme.customColors.black,
    fontWeight: 500,
  },
}));

type OptionsMap<T> = {
  label: string;
  optionValue: string;
  search: T[];
  isDefault: boolean;
};

class AvailableOptions {
  t: TFunction;
  includeConflictsFilters: boolean;

  constructor(t: TFunction, includeConflictsFilters: boolean) {
    this.t = t;
    this.includeConflictsFilters = includeConflictsFilters;
  }

  buildAvailableOptionsMap(): OptionsMap<VacancyAvailability>[] {
    if (this.includeConflictsFilters) {
      return [
        {
          label: this.t("Yes (w/o conflicts)"),
          optionValue: "1",
          search: [VacancyAvailability.Yes],
          isDefault: false,
        },
        {
          label: this.t("Yes (incl. conflicts)"),
          optionValue: "2",
          search: [VacancyAvailability.Yes, VacancyAvailability.MinorConflict],
          isDefault: true,
        },
        {
          label: this.t("No"),
          optionValue: "3",
          search: [VacancyAvailability.No],
          isDefault: false,
        },
      ];
    }

    return [
      {
        label: this.t("Yes"),
        optionValue: "1",
        search: [VacancyAvailability.Yes],
        isDefault: true,
      },
      {
        label: this.t("No"),
        optionValue: "2",
        search: [VacancyAvailability.No],
        isDefault: false,
      },
    ];
  }

  getOptionsForDropdown() {
    const options: OptionType[] = this.buildAvailableOptionsMap().map(o => ({
      value: o.optionValue,
      label: o.label,
    }));
    return options;
  }
}

class QualifiedOptions {
  t: TFunction;

  constructor(t: TFunction) {
    this.t = t;
  }

  buildQualifiedOptionsMap(): OptionsMap<VacancyQualification>[] {
    return [
      {
        label: this.t("Highly"),
        optionValue: "1",
        search: [VacancyQualification.Fully],
        isDefault: false,
      },
      {
        label: this.t("At least minimally"),
        optionValue: "2",
        search: [VacancyQualification.Fully, VacancyQualification.Minimally],
        isDefault: true,
      },
      {
        label: this.t("Show All"),
        optionValue: "3",
        search: [
          VacancyQualification.Fully,
          VacancyQualification.Minimally,
          VacancyQualification.NotQualified,
        ],
        isDefault: false,
      },
    ];
  }

  getOptionsForDropdown() {
    const options: OptionType[] = this.buildQualifiedOptionsMap().map(o => ({
      value: o.optionValue,
      label: o.label,
    }));
    return options;
  }
}
