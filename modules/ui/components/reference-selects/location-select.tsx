import * as React from "react";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocationOptions } from "reference-data/locations";

type Props = {
  orgId?: string;
  selectedLocationIds?: string[];
  setSelectedLocationIds: (locationIds?: string[]) => void;
  includeAllOption?: boolean;
  label?: string;
  multiple?: boolean;
};

export const LocationSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    label,
    selectedLocationIds,
    setSelectedLocationIds,
    includeAllOption = true,
    multiple = true,
  } = props;

  let locationOptions = useLocationOptions(orgId);

  if (includeAllOption) {
    locationOptions = locationOptions.sort((a, b) =>
      a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
    );
    locationOptions.unshift({ label: t("(All)"), value: "0" });
  }

  const selectedLocations = locationOptions.filter(
    e => e.value && selectedLocationIds?.includes(e.value.toString())
  );

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
      value={selectedLocations}
      multiple={multiple}
      options={locationOptions}
      withResetValue={false}
      onChange={onChangeLocations}
      placeholder={
        includeAllOption && selectedLocationIds?.length === 0
          ? t("(All)")
          : undefined
      }
      doSort={!includeAllOption}
    />
  );
};
