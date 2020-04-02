import * as React from "react";
import { SelectNew } from "ui/components/form/select-new";
import { useTranslation } from "react-i18next";
import { useContractOptions } from "reference-data/contracts";

type Props = {
  orgId: string;
  selectedContractId?: string;
  setSelectedContractId: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  includeAllOption?: boolean;
  showLabel?: boolean;
};

export const ContractSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    setSelectedContractId,
    selectedContractId,
    includeAllOption = true,
    showLabel = true,
  } = props;

  const contractOptions = useContractOptions(orgId);
  if (includeAllOption && contractOptions[0]?.value !== "0") {
    contractOptions.unshift({ label: "All Contracts", value: "0" });
  }

  const selectedContract =
    contractOptions.find((c: any) => c.value === selectedContractId) ??
    includeAllOption
      ? contractOptions[0]
      : { value: "", label: "" };

  return (
    <SelectNew
      label={showLabel ? t("Contract") : undefined}
      value={selectedContract}
      multiple={false}
      options={contractOptions}
      withResetValue={false}
      onChange={e => {
        if (e.value.toString() === "0") {
          setSelectedContractId(undefined);
        } else {
          setSelectedContractId(e.value.toString());
        }
      }}
    />
  );
};
