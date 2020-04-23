import * as React from "react";
import { SelectNew } from "ui/components/form/select-new";
import { useTranslation } from "react-i18next";
import { DataImportType } from "graphql/server-types.gen";
import { useDataImportTypeOptions } from "reference-data/data-import-types";

type Props = {
  selectedTypeId?: DataImportType;
  setSelectedTypeId: (typeId?: DataImportType) => void;
  includeAllOption?: boolean;
};

export const ImportTypeFilter: React.FC<Props> = props => {
  const { t } = useTranslation();
  const { setSelectedTypeId, selectedTypeId, includeAllOption = true } = props;

  const typeOptions = useDataImportTypeOptions(t, includeAllOption);

  const selectedType =
    selectedTypeId === undefined
      ? typeOptions[0]
      : typeOptions.find((s: any) => s.value === selectedTypeId.toString());

  return (
    <SelectNew
      label={t("Import type")}
      value={selectedType ?? { label: "", value: "" }}
      multiple={false}
      options={typeOptions}
      withResetValue={false}
      onChange={e => {
        if (e.value.toString() === "0") {
          setSelectedTypeId(undefined);
        } else {
          setSelectedTypeId(e.value as DataImportType);
        }
      }}
      doSort={false}
    />
  );
};
