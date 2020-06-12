import * as React from "react";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAbsenceReasonCategoryOptions } from "reference-data/absence-reason-categories";

type Props = {
  orgId: string;
  selectedAbsenceReasonCategoryIds?: string[];
  setSelectedAbsenceReasonCategoryIds: (
    absenceReasonCategoryIds?: string[]
  ) => void;
  includeAllOption?: boolean;
  label?: string;
  multiple?: boolean;
};

export const AbsenceReasonCategorySelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    label,
    selectedAbsenceReasonCategoryIds,
    setSelectedAbsenceReasonCategoryIds,
    includeAllOption = true,
    multiple = true,
  } = props;

  let absenceReasonCategoryOptions = useAbsenceReasonCategoryOptions(orgId);

  if (includeAllOption) {
    absenceReasonCategoryOptions = absenceReasonCategoryOptions.sort((a, b) =>
      a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
    );
    absenceReasonCategoryOptions.unshift({ label: t("(All)"), value: "0" });
  }

  const selectedAbsenceReasonCategories = absenceReasonCategoryOptions.filter(
    e =>
      e.value && selectedAbsenceReasonCategoryIds?.includes(e.value.toString())
  );

  const onChangeAbsenceReasonCategories = useCallback(
    value => {
      const ids: string[] = value
        ? Array.isArray(value)
          ? value.map((v: OptionType) => v.value)
          : [value.value]
        : [];
      if (ids.includes("0")) {
        setSelectedAbsenceReasonCategoryIds(undefined);
      } else {
        setSelectedAbsenceReasonCategoryIds(ids);
      }
    },
    [setSelectedAbsenceReasonCategoryIds]
  );

  return (
    <SelectNew
      label={label}
      value={
        multiple
          ? selectedAbsenceReasonCategories
          : selectedAbsenceReasonCategories[0] ?? { value: "", label: "" }
      }
      multiple={multiple}
      options={absenceReasonCategoryOptions}
      withResetValue={false}
      onChange={onChangeAbsenceReasonCategories}
      placeholder={
        includeAllOption && selectedAbsenceReasonCategoryIds?.length === 0
          ? t("(All)")
          : undefined
      }
      doSort={!includeAllOption}
    />
  );
};
