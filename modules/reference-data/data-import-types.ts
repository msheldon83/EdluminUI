import { useQueryBundle } from "graphql/hooks";
import { GetDataImportTypes } from "./get-data-import-types.gen";
import { compact } from "lodash-es";
import { useMemo } from "react";
import i18next = require("i18next");

export function useDataImportTypes() {
  const dataImportTypes = useQueryBundle(GetDataImportTypes, {
    fetchPolicy: "cache-first",
  });

  return useMemo(() => {
    if (
      dataImportTypes.state === "DONE" &&
      dataImportTypes.data?.referenceData?.dataImportTypes
    ) {
      return compact(dataImportTypes.data.referenceData.dataImportTypes) ?? [];
    }
    return [];
  }, [dataImportTypes]);
}

export function useDataImportTypeOptions(
  t: i18next.TFunction,
  addAll?: boolean
) {
  const dataImportTypes = useDataImportTypes();

  return useMemo(() => {
    const options = dataImportTypes
      .map(d => ({
        label: d?.description ?? "",
        value: d?.enumValue?.toString() ?? "",
      }))
      .sort((a, b) => (a.label > b.label ? 1 : -1));
    if (addAll) options.unshift({ label: t("(All)"), value: "0" });

    return options;
  }, [addAll, dataImportTypes, t]);
}
