import * as React from "react";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useVacancyReasonOptions } from "reference-data/vacancy-reasons";

type Props = {
  orgId: string;
  selectedVacancyReasonIds?: string[];
  setSelectedVacancyReasonIds: (vacancyReasonIds?: string[]) => void;
  includeAllOption?: boolean;
  label?: string;
  multiple?: boolean;
  errorMessage?: string;
};

export const VacancyReasonSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    label,
    selectedVacancyReasonIds,
    setSelectedVacancyReasonIds,
    includeAllOption = true,
    multiple = true,
    errorMessage,
  } = props;

  let vacancyReasonOptions = useVacancyReasonOptions(orgId);

  if (includeAllOption) {
    vacancyReasonOptions = vacancyReasonOptions.sort((a, b) =>
      a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
    );
    vacancyReasonOptions.unshift({ label: t("(All)"), value: "0" });
  }

  const selectedVacancyReasons = vacancyReasonOptions.filter(
    e => e.value && selectedVacancyReasonIds?.includes(e.value.toString())
  );

  const onChangeVacancyReasons = useCallback(
    value => {
      const ids: string[] = value
        ? Array.isArray(value)
          ? value.map((v: OptionType) => v.value)
          : [value.value]
        : [];
      if (ids.includes("0")) {
        setSelectedVacancyReasonIds(undefined);
      } else {
        setSelectedVacancyReasonIds(ids);
      }
    },
    [setSelectedVacancyReasonIds]
  );

  return (
    <SelectNew
      label={label}
      value={
        multiple
          ? selectedVacancyReasons
          : selectedVacancyReasons[0] ?? { value: "", label: "" }
      }
      multiple={multiple}
      options={vacancyReasonOptions}
      withResetValue={false}
      onChange={onChangeVacancyReasons}
      placeholder={
        includeAllOption && selectedVacancyReasonIds?.length === 0
          ? t("(All)")
          : undefined
      }
      doSort={!includeAllOption}
      inputStatus={errorMessage ? "error" : "default"}
      validationMessage={errorMessage}
    />
  );
};
