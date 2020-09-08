import * as React from "react";
import { Select, OptionType } from "ui/components/form/select";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { usePayCodeOptions } from "reference-data/pay-codes";

type Props = {
  orgId?: string;
  selectedPayCodeIds?: string[];
  setSelectedPayCodeIds: (payCodeIds?: string[]) => void;
  includeAllOption?: boolean;
  label?: string;
  multiple?: boolean;
};

export const PayCodeSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    label,
    selectedPayCodeIds,
    setSelectedPayCodeIds,
    includeAllOption = true,
    multiple = true,
  } = props;

  let payCodeOptions = usePayCodeOptions(orgId);

  if (includeAllOption) {
    payCodeOptions = payCodeOptions.sort((a, b) =>
      a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
    );
    payCodeOptions.unshift({ label: t("(All)"), value: "0" });
  }

  const selectedPayCodes = payCodeOptions.filter(
    e => e.value && selectedPayCodeIds?.includes(e.value.toString())
  );

  const onChangePayCodes = useCallback(
    value => {
      const ids: string[] = value
        ? Array.isArray(value)
          ? value.map((v: OptionType) => v.value)
          : [value.value]
        : [];
      if (ids.includes("0")) {
        setSelectedPayCodeIds(undefined);
      } else {
        setSelectedPayCodeIds(ids);
      }
    },
    [setSelectedPayCodeIds]
  );

  return (
    <Select
      label={label}
      value={
        multiple
          ? selectedPayCodes
          : selectedPayCodes[0] ?? { value: "", label: "" }
      }
      multiple={multiple}
      options={payCodeOptions}
      withResetValue={false}
      onChange={onChangePayCodes}
      placeholder={
        includeAllOption && selectedPayCodeIds?.length === 0
          ? t("(All)")
          : undefined
      }
      doSort={!includeAllOption}
    />
  );
};
