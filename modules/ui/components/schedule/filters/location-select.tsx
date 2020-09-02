import * as React from "react";
import { Select, OptionType } from "ui/components/form/select";
import { useTranslation } from "react-i18next";
import { useLocationOptions } from "reference-data/locations";

// NOTE
// The filters in this folder were added for the functionality of Any/All.
// The concept of this functionality is not used anywhere else and
// I did not want to shoe-horn in logic that was exclusive to the Calendar Changes.
// Back-end is assuming that undefined is Any and All Schools === affecsAllLocations

type Props = {
  orgId: string;
  selectedLocationId?: string;
  setSelectedLocationId: (locationId?: string) => void;
  label?: string;
};

export const LocationSelectCalendarChanges: React.FC<Props> = props => {
  const { t } = useTranslation();
  const { orgId, label, selectedLocationId, setSelectedLocationId } = props;

  let locationOptions = useLocationOptions(orgId);

  if (locationOptions[0]?.value !== "0") {
    locationOptions = locationOptions.sort((a, b) =>
      a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
    );
    locationOptions.unshift({ label: t("All Schools"), value: "1" });
    locationOptions.unshift({ label: t("(Any)"), value: "0" });
  }

  let selectedLocation = locationOptions.find(
    (e: any) => e.value.toString() === selectedLocationId
  );

  selectedLocation =
    selectedLocation === undefined
      ? { label: t("(Any)"), value: "0" }
      : selectedLocation;

  return (
    <Select
      label={label}
      value={selectedLocation}
      multiple={false}
      options={locationOptions}
      withResetValue={false}
      onChange={e => {
        if (e.value.toString() === "0") {
          setSelectedLocationId(undefined);
        } else {
          setSelectedLocationId(e.value.toString());
        }
      }}
      doSort={false}
    />
  );
};
