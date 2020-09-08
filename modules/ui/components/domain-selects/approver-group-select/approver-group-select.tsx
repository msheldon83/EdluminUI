import * as React from "react";
import { Select, OptionType } from "ui/components/form/select";
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
  addApprovedOption?: boolean;
  errorMessage?: string;
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
    addApprovedOption = false,
    errorMessage,
  } = props;

  let approverGroupOptions = useApproverGroupOptions(orgId, idsToFilterOut);

  if (addApprovedOption) {
    approverGroupOptions = approverGroupOptions.sort((a, b) =>
      a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
    );
    approverGroupOptions.unshift({ label: t("(Approved)"), value: "0" });
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
      setSelectedApproverGroupHeaderIds(ids);
    },
    [setSelectedApproverGroupHeaderIds]
  );

  return (
    <Select
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
      doSort={!addApprovedOption}
      inputStatus={errorMessage ? "error" : "default"}
      validationMessage={errorMessage}
    />
  );
};
