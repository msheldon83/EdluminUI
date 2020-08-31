import * as React from "react";
import { SelectNew } from "ui/components/form/select-new";
import { useTranslation } from "react-i18next";
import { useContractOptions } from "reference-data/contracts";

// NOTE
// The filters in this folder were added for the functionality of Any/All.
// The concept of this functionality is not used anywhere else and
// I did not want to shoe-horn in logic that was exclusive to the Calendar Changes.
// Back-end is assuming that undefined is Any and All Contracts === affecsAllContracts

type Props = {
  orgId: string;
  selectedContractId?: string;
  setSelectedContractId: (contractId?: string) => void;
  showLabel?: boolean;
};

export const ContractSelectCalendarChanges: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    selectedContractId,
    setSelectedContractId,
    showLabel = true,
  } = props;

  let contractOptions = useContractOptions(orgId);
  if (contractOptions[0]?.value !== "0") {
    contractOptions = contractOptions.sort((a, b) =>
      a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
    );
    contractOptions.unshift({ label: t("All Contracts"), value: "1" });
    contractOptions.unshift({ label: t("(Any)"), value: "0" });
  }

  let selectedContract = contractOptions.find(
    (c: any) => c.value.toString() === selectedContractId
  );

  selectedContract =
    selectedContract === undefined
      ? { label: t("(Any)"), value: "0" }
      : selectedContract;

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
      doSort={false}
    />
  );
};
