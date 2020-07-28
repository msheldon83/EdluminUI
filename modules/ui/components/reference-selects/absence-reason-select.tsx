import * as React from "react";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAbsenceReasonOptions } from "reference-data/absence-reasons";

type Props = {
  orgId: string;
  selectedAbsenceReasonIds?: string[];
  setSelectedAbsenceReasonIds: (absenceReasonIds?: string[]) => void;
  includeAllOption?: boolean;
  label?: string;
  multiple?: boolean;
  errorMessage?: string;
  idsToInclude?: string[];
};

export const AbsenceReasonSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    label,
    selectedAbsenceReasonIds,
    setSelectedAbsenceReasonIds,
    includeAllOption = true,
    multiple = true,
    errorMessage,
    idsToInclude,
  } = props;

  let absenceReasonOptions = useAbsenceReasonOptions(orgId);

  if (includeAllOption) {
    absenceReasonOptions = absenceReasonOptions.sort((a, b) =>
      a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
    );
    absenceReasonOptions.unshift({ label: t("(All)"), value: "0" });
  }

  if (idsToInclude) {
    absenceReasonOptions = absenceReasonOptions.filter(x =>
      idsToInclude.includes(x.value)
    );
  }

  const selectedAbsenceReasons = absenceReasonOptions.filter(
    e => e.value && selectedAbsenceReasonIds?.includes(e.value.toString())
  );

  const onChangeAbsenceReasons = useCallback(
    value => {
      const ids: string[] = value
        ? Array.isArray(value)
          ? value.map((v: OptionType) => v.value)
          : [value.value]
        : [];
      if (ids.includes("0")) {
        setSelectedAbsenceReasonIds(undefined);
      } else {
        setSelectedAbsenceReasonIds(ids);
      }
    },
    [setSelectedAbsenceReasonIds]
  );

  return (
    <SelectNew
      label={label}
      value={
        multiple
          ? selectedAbsenceReasons
          : selectedAbsenceReasons[0] ?? { value: "", label: "" }
      }
      multiple={multiple}
      options={absenceReasonOptions}
      withResetValue={false}
      onChange={onChangeAbsenceReasons}
      placeholder={
        includeAllOption && selectedAbsenceReasonIds?.length === 0
          ? t("(All)")
          : undefined
      }
      doSort={!includeAllOption}
      inputStatus={errorMessage ? "error" : "default"}
      validationMessage={errorMessage}
    />
  );
};
