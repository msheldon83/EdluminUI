import * as React from "react";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocationOptions } from "reference-data/locations";

// NOTE
// The filters in this folder were added for the functionality of Any/All.
// The concept of this functionality is not used anywhere else and
// I did not want to shoe-horn in logic that was exclusive to the Calendar Changes.
// Back-end is assuming that undefined is Any and All Schools === affecsAllLocations

type Props = {
  orgId?: string;
  selectedLocationIds?: string[];
  setSelectedLocationIds: (locationIds?: string[]) => void;
  label?: string;
  multiple?: boolean;
};

export const LocationSelectCalendarChanges: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    label,
    selectedLocationIds,
    setSelectedLocationIds,
    multiple = true,
  } = props;

  let locationOptions = useLocationOptions(orgId);

  if (locationOptions[0]?.value !== "0") {
    locationOptions = locationOptions.sort((a, b) =>
      a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
    );
    locationOptions.unshift({ label: t("All Schools"), value: "1" });
    locationOptions.unshift({ label: t("(Any)"), value: "0" });
  }

  let selectedLocations = locationOptions.filter(
    e => e.value && selectedLocationIds?.includes(e.value.toString())
  );

  selectedLocations =
    selectedLocations.length === 0 ? [locationOptions[0]] : selectedLocations;

  const onChangeLocations = useCallback(
    value => {
      const ids: string[] = value
        ? Array.isArray(value)
          ? value.map((v: OptionType) => v.value)
          : [value.value]
        : [];
      if (ids.includes("0")) {
        setSelectedLocationIds(undefined);
      } else {
        setSelectedLocationIds(ids);
      }
    },
    [setSelectedLocationIds]
  );

  return (
    <SelectNew
      label={label}
      value={
        multiple
          ? selectedLocations
          : selectedLocations[0] ?? { value: "", label: "" }
      }
      multiple={multiple}
      options={locationOptions}
      withResetValue={false}
      onChange={onChangeLocations}
      placeholder={selectedLocationIds?.length === 0 ? t("(Any)") : undefined}
      doSort={false}
    />
  );
};
