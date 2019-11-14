import * as React from "react";
import { Grid, InputLabel, makeStyles, TextField } from "@material-ui/core";
import { useDeferredState } from "hooks";
import { useQueryParamIso } from "hooks/query-params";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { Select, SelectValueType } from "ui/components/form/select";
import { Qualified, Available } from "graphql/server-types.gen";
import { TFunction } from "i18next";
import { OptionTypeBase } from "react-select";

type Props = {
  showQualifiedAndAvailable: boolean;
  search: (
    name: string,
    qualified: Qualified[],
    available: Available[],
    favoritesOnly: boolean
  ) => Promise<void>;
};

export const AssignSubFilters: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [name, setName] = React.useState("");

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

  const [qualifiedAndAvailableSearch, setSearch] = React.useState<{
    qualified?: Qualified[];
    available?: Available[];
    favoritesOnly: boolean;
  }>({
    qualified: qualifiedOptionsMap.find(q => q.isDefault)?.search,
    available: availableOptionsMap.find(a => a.isDefault)?.search,
    favoritesOnly: false,
  });

  const nameSearchInProgress = () => {
    return !!name.length;
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={3}>
        <InputLabel className={classes.label}>{t("Name")}</InputLabel>
        <TextField
          className={classes.textField}
          variant="outlined"
          name={"name"}
          value={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            if (!event.target.value || !event.target.value.length) {
              setName("");
            } else {
              setName(event.target.value);
            }
          }}
          placeholder={t("Search for first or last name")}
          fullWidth
        />
      </Grid>
      {props.showQualifiedAndAvailable && (
        <>
          <Grid item xs={2}>
            <InputLabel className={classes.label}>{t("Qualified")}</InputLabel>
            <Select
              value={qualifiedOptions.find((o: any) => {
                const optionsMap = qualifiedOptionsMap.find(
                  m => m.search === qualifiedAndAvailableSearch.qualified
                );
                return o.value === optionsMap?.optionValue;
              })}
              label=""
              disabled={nameSearchInProgress()}
              options={qualifiedOptions}
              isClearable={false}
              onChange={(e: SelectValueType) => {
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
                  ...qualifiedAndAvailableSearch,
                  qualified: optionsMap.search,
                };
                setSearch(updatedSearchOptions);
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <InputLabel className={classes.label}>{t("Available")}</InputLabel>
            <Select
              value={availableOptions.find((o: any) => {
                const optionsMap = availableOptionsMap.find(
                  m => m.search === qualifiedAndAvailableSearch.available
                );
                return o.value === optionsMap?.optionValue;
              })}
              label=""
              disabled={nameSearchInProgress()}
              options={availableOptions}
              isClearable={false}
              onChange={(e: SelectValueType) => {
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
                  ...qualifiedAndAvailableSearch,
                  available: optionsMap.search,
                };
                setSearch(updatedSearchOptions);
              }}
            />
          </Grid>
        </>
      )}
      <Grid item xs={2}>
        <InputLabel className={classes.label}>{t("Show")}</InputLabel>
        <Select
          value={showOptions.find(
            (s: any) =>
              (qualifiedAndAvailableSearch.favoritesOnly &&
                s.value === "true") ||
              (!qualifiedAndAvailableSearch.favoritesOnly &&
                s.value === "false")
          )}
          label=""
          disabled={nameSearchInProgress()}
          options={showOptions}
          isClearable={false}
          onChange={(e: SelectValueType) => {
            let selectedValue: string | null = null;
            if (e) {
              if (Array.isArray(e)) {
                selectedValue = (e as Array<OptionTypeBase>)[0].value;
              } else {
                selectedValue = (e as OptionTypeBase).value;
              }
            }

            const updatedSearchOptions = {
              ...qualifiedAndAvailableSearch,
              favoritesOnly: selectedValue === "true",
            };
            setSearch(updatedSearchOptions);
          }}
        />
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  label: {
    // color: theme.customColors.black,
    fontWeight: 500,
  },
  textField: {
    marginTop: theme.spacing(2),
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

  buildAvailableOptionsMap(): OptionsMap<Available>[] {
    if (this.includeConflictsFilters) {
      return [
        {
          label: this.t("Yes (w/o conflicts)"),
          optionValue: "1",
          search: [Available.Yes],
          isDefault: false,
        },
        {
          label: this.t("Yes (incl. conflicts)"),
          optionValue: "2",
          search: [Available.Yes, Available.MinorConflict],
          isDefault: true,
        },
        {
          label: this.t("No"),
          optionValue: "3",
          search: [Available.No],
          isDefault: false,
        },
      ];
    }

    return [
      {
        label: this.t("Yes"),
        optionValue: "1",
        search: [Available.Yes],
        isDefault: true,
      },
      {
        label: this.t("No"),
        optionValue: "2",
        search: [Available.No],
        isDefault: false,
      },
    ];
  }

  getOptionsForDropdown() {
    const options = this.buildAvailableOptionsMap().map(o => {
      return { value: o.optionValue, label: o.label };
    });
    return options;
  }
}

class QualifiedOptions {
  t: TFunction;

  constructor(t: TFunction) {
    this.t = t;
  }

  buildQualifiedOptionsMap(): OptionsMap<Qualified>[] {
    return [
      {
        label: this.t("Highly"),
        optionValue: "1",
        search: [Qualified.Fully],
        isDefault: false,
      },
      {
        label: this.t("At least minimally"),
        optionValue: "2",
        search: [Qualified.Fully, Qualified.Minimally],
        isDefault: true,
      },
      {
        label: this.t("Show All"),
        optionValue: "3",
        search: [Qualified.Fully, Qualified.Minimally, Qualified.NotQualified],
        isDefault: false,
      },
    ];
  }

  getOptionsForDropdown() {
    const options = this.buildQualifiedOptionsMap().map(o => {
      return { value: o.optionValue, label: o.label };
    });
    return options;
  }
}
