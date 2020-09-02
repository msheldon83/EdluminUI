import * as React from "react";
import { Select, OptionType } from "ui/components/form/select";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useEndorsementOptions } from "reference-data/endorsements";

type Props = {
  orgId: string;
  selectedEndorsementIds?: string[];
  setSelectedEndorsementIds: (endorsementIds?: string[]) => void;
  includeAllOption?: boolean;
  label?: string;
  multiple?: boolean;
};

export const EndorsementSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    label,
    selectedEndorsementIds,
    setSelectedEndorsementIds,
    includeAllOption = true,
    multiple = true,
  } = props;

  let endorsementOptions = useEndorsementOptions(orgId);

  if (includeAllOption) {
    endorsementOptions = endorsementOptions.sort((a, b) =>
      a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
    );
    endorsementOptions.unshift({ label: t("(All)"), value: "0" });
  }

  const selectedEndorsements = endorsementOptions.filter(
    e => e.value && selectedEndorsementIds?.includes(e.value.toString())
  );

  const onChangeEndorsements = useCallback(
    value => {
      const ids: string[] = value
        ? Array.isArray(value)
          ? value.map((v: OptionType) => v.value)
          : [value.value]
        : [];
      if (ids.includes("0")) {
        setSelectedEndorsementIds(undefined);
      } else {
        setSelectedEndorsementIds(ids);
      }
    },
    [setSelectedEndorsementIds]
  );

  return (
    <Select
      label={label}
      value={
        multiple
          ? selectedEndorsements
          : selectedEndorsements[0] ?? { value: "", label: "" }
      }
      multiple={multiple}
      options={endorsementOptions}
      withResetValue={false}
      onChange={onChangeEndorsements}
      placeholder={
        includeAllOption && selectedEndorsementIds?.length === 0
          ? t("(All)")
          : undefined
      }
      doSort={!includeAllOption}
    />
  );
};
