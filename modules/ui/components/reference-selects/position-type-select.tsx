import * as React from "react";
import { Select, OptionType } from "ui/components/form/select";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { usePositionTypeOptions } from "reference-data/position-types";

type Props = {
  orgId?: string;
  selectedPositionTypeIds?: string[];
  setSelectedPositionTypeIds: (positionTypeIds?: string[]) => void;
  includeAllOption?: boolean;
  label?: string;
  multiple?: boolean;
  disabled?: boolean;
  idsToRemoveFromOptions?: string[];
};

export const PositionTypeSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    label,
    selectedPositionTypeIds,
    setSelectedPositionTypeIds,
    includeAllOption = true,
    multiple = true,
    disabled = false,
  } = props;

  let positionTypeOptions = usePositionTypeOptions(orgId);

  if (includeAllOption) {
    positionTypeOptions = positionTypeOptions.sort((a, b) =>
      a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
    );
    positionTypeOptions.unshift({ label: t("(All)"), value: "0" });
  }

  if (props.idsToRemoveFromOptions) {
    positionTypeOptions = positionTypeOptions.filter(
      x => !props.idsToRemoveFromOptions?.includes(x.value)
    );
  }

  const selectedPositionTypes = positionTypeOptions.filter(
    e => e.value && selectedPositionTypeIds?.includes(e.value.toString())
  );

  const onChangePositionTypes = useCallback(
    value => {
      const ids: string[] = value
        ? Array.isArray(value)
          ? value.map((v: OptionType) => v.value)
          : [value.value]
        : [];
      if (ids.includes("0")) {
        setSelectedPositionTypeIds(undefined);
      } else {
        setSelectedPositionTypeIds(ids);
      }
    },
    [setSelectedPositionTypeIds]
  );

  return (
    <Select
      label={label}
      value={
        multiple
          ? selectedPositionTypes
          : selectedPositionTypes[0] ?? { value: "", label: "" }
      }
      multiple={multiple}
      options={positionTypeOptions}
      withResetValue={false}
      onChange={onChangePositionTypes}
      placeholder={
        includeAllOption && selectedPositionTypeIds?.length === 0
          ? t("(All)")
          : undefined
      }
      doSort={!includeAllOption}
      disabled={disabled}
    />
  );
};
