import * as React from "react";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAccountingCodeOptions } from "reference-data/accounting-codes";

type Props = {
  orgId?: string;
  selectedAccountingCodeIds?: string[];
  setSelectedAccountingCodeIds: (accountingCodeIds?: string[]) => void;
  includeAllOption?: boolean;
  label?: string;
  multiple?: boolean;
};

export const AccountingCodeSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    label,
    selectedAccountingCodeIds,
    setSelectedAccountingCodeIds,
    includeAllOption = true,
    multiple = true,
  } = props;

  let accountingCodeOptions = useAccountingCodeOptions(orgId);

  if (includeAllOption) {
    accountingCodeOptions = accountingCodeOptions.sort((a, b) =>
      a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
    );
    accountingCodeOptions.unshift({ label: t("(All)"), value: "0" });
  }

  const selectedAccountingCodes = accountingCodeOptions.filter(
    e => e.value && selectedAccountingCodeIds?.includes(e.value.toString())
  );

  const onChangeAccountingCodes = useCallback(
    value => {
      const ids: string[] = value
        ? Array.isArray(value)
          ? value.map((v: OptionType) => v.value)
          : [value.value]
        : [];
      if (ids.includes("0")) {
        setSelectedAccountingCodeIds(undefined);
      } else {
        setSelectedAccountingCodeIds(ids);
      }
    },
    [setSelectedAccountingCodeIds]
  );

  return (
    <SelectNew
      label={label}
      value={
        multiple
          ? selectedAccountingCodes
          : selectedAccountingCodes[0] ?? { value: "", label: "" }
      }
      multiple={multiple}
      options={accountingCodeOptions}
      withResetValue={false}
      onChange={onChangeAccountingCodes}
      placeholder={
        includeAllOption && selectedAccountingCodeIds?.length === 0
          ? t("(All)")
          : undefined
      }
      doSort={!includeAllOption}
    />
  );
};
