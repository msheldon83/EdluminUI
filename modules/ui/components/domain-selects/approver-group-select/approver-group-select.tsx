import * as React from "react";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useApproverGroupOptions } from "./approver-groups";

type Props = {
  orgId: string;
  selectedApproverGroupHeaderIds?: string[];
  setSelectedApproverGroupHeaderIds: (ids?: string[]) => void;
  label?: string;
  multiple?: boolean;
  disabled?: boolean;
  idsToFilterOut?: string[];
  idsToInclude?: string[];
};

export const ApproverGroupSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    label,
    selectedApproverGroupHeaderIds,
    setSelectedApproverGroupHeaderIds,
    multiple = false,
    disabled = false,
    idsToFilterOut,
    idsToInclude,
  } = props;

  let approverGroupOptions = useApproverGroupOptions(orgId, idsToFilterOut);

  if (idsToInclude) {
    approverGroupOptions = approverGroupOptions.filter(x =>
      idsToInclude.includes(x.value)
    );
  }

  const selectedGroups = approverGroupOptions.filter(
    e => e.value && selectedApproverGroupHeaderIds?.includes(e.value.toString())
  );

  const onChangeApproverGroups = useCallback(
    value => {
      const ids: string[] = value
        ? Array.isArray(value)
          ? value.map((v: OptionType) => v.value)
          : [value.value]
        : [];
      if (ids.includes("0")) {
        setSelectedApproverGroupHeaderIds(undefined);
      } else {
        setSelectedApproverGroupHeaderIds(ids);
      }
    },
    [setSelectedApproverGroupHeaderIds]
  );

  return (
    <SelectNew
      label={label}
      value={
        multiple
          ? selectedGroups
          : selectedGroups[0] ?? { value: "", label: "" }
      }
      multiple={multiple}
      options={approverGroupOptions}
      withResetValue={false}
      onChange={onChangeApproverGroups}
      disabled={disabled}
    />
  );
};
