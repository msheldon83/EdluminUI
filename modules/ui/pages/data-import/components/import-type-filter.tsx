import * as React from "react";
import { useMemo } from "react";
import { SelectNew } from "ui/components/form/select-new";
import { useTranslation } from "react-i18next";
import { DataImportType } from "graphql/server-types.gen";
import { getDisplayName } from "ui/components/enumHelpers";

type Props = {
  selectedTypeId?: DataImportType;
  setSelectedTypeId: (typeId?: DataImportType) => void;
};

export const ImportTypeFilter: React.FC<Props> = props => {
  const { t } = useTranslation();
  const { setSelectedTypeId, selectedTypeId } = props;

  const typeOptions = useMemo(() => {
    const types = Object.values(DataImportType);

    const options = types
      .map(x => {
        if (x === DataImportType.Invalid) {
          return { label: t("(All)"), value: "0" };
        } else {
          return {
            label: getDisplayName("dataImportType", x, t) ?? "",
            value: x.toString(),
          };
        }
      })
      .sort((a, b) => (a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1));
    return options;
  }, [t]);

  const selectedType =
    selectedTypeId === undefined
      ? typeOptions[0]
      : typeOptions.find((s: any) => s.value === selectedTypeId.toString());

  return (
    <SelectNew
      label={t("Import type")}
      value={selectedType}
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
