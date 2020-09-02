import * as React from "react";
import { Select } from "ui/components/form/select";
import { useTranslation } from "react-i18next";
import { DataImportType } from "graphql/server-types.gen";
import { useDataImportTypeOptions } from "reference-data/data-import-types";

type Props = {
  selectedTypeId?: DataImportType;
  setSelectedTypeId: (typeId?: DataImportType) => void;
  includeAllOption?: boolean;
  disabled?: boolean;
};

export const ImportTypeFilter: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    setSelectedTypeId,
    selectedTypeId,
    includeAllOption = true,
    disabled = false,
  } = props;

  const typeOptions = useDataImportTypeOptions(t, includeAllOption);

  const selectedType =
    selectedTypeId === undefined
      ? { label: "", value: "" }
      : typeOptions.find((s: any) => s.value === selectedTypeId.toString());

  return (
    <Select
      label={t("Import type")}
      value={selectedType ?? { label: "", value: "" }}
      multiple={false}
      options={typeOptions}
      withResetValue={!includeAllOption}
      onChange={e => {
        if (e.value.toString() === "0") {
          setSelectedTypeId(undefined);
        } else {
          setSelectedTypeId(e.value as DataImportType);
        }
      }}
      doSort={false}
      disabled={disabled}
    />
  );
};
