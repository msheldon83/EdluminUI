import * as React from "react";
import { Select } from "ui/components/form/select";
import { useTranslation } from "react-i18next";
import { useLocationGroupOptions } from "reference-data/location-groups";

type Props = {
  orgId?: string;
  selectedLocationGroupId?: string;
  setSelectedLocationGroupId: (locationGroupId?: string) => void;
  includeAllOption?: boolean;
  label?: string;
};

export const LocationGroupSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    label,
    selectedLocationGroupId,
    setSelectedLocationGroupId,
    includeAllOption = true,
  } = props;

  let locationGroupOptions = useLocationGroupOptions(orgId);

  if (includeAllOption) {
    locationGroupOptions = locationGroupOptions.sort((a, b) =>
      a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
    );
    locationGroupOptions.unshift({ label: t("(All)"), value: "0" });
  }

  const selectedLocationGroups = locationGroupOptions.find(
    e => e.value && selectedLocationGroupId === e.value.toString()
  );

  return (
    <Select
      label={label}
      value={selectedLocationGroups}
      multiple={false}
      options={locationGroupOptions}
      withResetValue={false}
      onChange={e => {
        setSelectedLocationGroupId(e.value.toString());
      }}
      placeholder={
        includeAllOption && selectedLocationGroupId ? t("(All)") : undefined
      }
      doSort={!includeAllOption}
    />
  );
};
