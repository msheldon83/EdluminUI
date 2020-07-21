import { Grid, FormControlLabel, Checkbox } from "@material-ui/core";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { FilterQueryParams, SubHomeQueryFilters } from "./filter-params";
import { useTranslation } from "react-i18next";
import { SelectNew as Select, OptionType } from "ui/components/form/select-new";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { PreferenceFilter as PreferenceFilterEnum } from "graphql/server-types.gen";
import { GetPreferenceFilter } from "../graphql/get-preference-filter.gen";
import { UpdatePreferenceFilter } from "../graphql/update-preference-filter.gen";

type Props = { userId: string } & SubHomeQueryFilters;

export const PreferenceFilter: React.FC<Props> = ({
  userId,
  preferenceFilter,
}) => {
  const { t } = useTranslation();
  const [_, updateFilters] = useQueryParamIso(FilterQueryParams);
  const [rowVersion, updateRowVersion] = React.useState<string>("");

  const preferenceOptions: OptionType[] = [
    { label: t("Favorites Only"), value: "SHOW_FAVORITES" },
    { label: t("Default"), value: "SHOW_FAVORITES_AND_DEFAULT" },
    { label: t("All (ignore preferences)"), value: "SHOW_ALL" },
  ];

  const getPreferenceFilter = useQueryBundle(GetPreferenceFilter, {
    variables: { userId },
  });
  const getPreferenceQueryData =
    getPreferenceFilter.state === "LOADING"
      ? undefined
      : getPreferenceFilter.data.user?.byId;

  React.useEffect(() => {
    if (getPreferenceQueryData) {
      const newRowVersion = getPreferenceQueryData.rowVersion;
      updateRowVersion(newRowVersion);
      const newPreferenceFilter =
        getPreferenceQueryData.preferences?.subJobPreferenceFilter;
      if (newPreferenceFilter && newPreferenceFilter !== preferenceFilter) {
        updateFilters({ preferenceFilter: newPreferenceFilter });
      }
    }
  }, [getPreferenceQueryData, updateFilters, preferenceFilter, rowVersion]);

  const [updatePreferenceFilter] = useMutationBundle(UpdatePreferenceFilter, {
    refetchQueries: ["GetPreferenceFilter"],
  });

  const onChangePreference: (o: OptionType) => void = async ({ value }) => {
    const preferenceFilter: PreferenceFilterEnum =
      typeof value === "number" ||
      value === "INVALID" ||
      !Object.values(PreferenceFilterEnum).includes(
        value as PreferenceFilterEnum
      )
        ? ("SHOW_FAVORITES_AND_DEFAULT" as PreferenceFilterEnum)
        : (value as PreferenceFilterEnum);
    updateFilters({ preferenceFilter });
    await updatePreferenceFilter({
      variables: {
        userId,
        rowVersion,
        subJobPreferenceFilter: preferenceFilter,
      },
    });
  };

  return (
    <Grid item xs={12} sm={6} md={3} lg={3}>
      <Select
        label={t("Show")}
        onChange={onChangePreference}
        value={preferenceOptions.find(o => o.value == preferenceFilter)}
        options={preferenceOptions}
        multiple={false}
        placeholder={t("Search for schools")}
      />
    </Grid>
  );
};
