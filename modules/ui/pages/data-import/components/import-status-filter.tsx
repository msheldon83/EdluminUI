import * as React from "react";
import { useMemo } from "react";
import { Select } from "ui/components/form/select";
import { useTranslation } from "react-i18next";
import { DataImportStatus } from "graphql/server-types.gen";
import { getDisplayName } from "ui/components/enumHelpers";

type Props = {
  selectedStatusId?: DataImportStatus;
  setSelectedStatusId: (statusId?: DataImportStatus) => void;
};

export const ImportStatusFilter: React.FC<Props> = props => {
  const { t } = useTranslation();
  const { setSelectedStatusId, selectedStatusId } = props;

  const statusOptions = useMemo(() => {
    const statuses = Object.values(DataImportStatus);

    const options = statuses
      .map(s => {
        if (s === DataImportStatus.Invalid) {
          return { label: t("(All)"), value: "0" };
        } else {
          return {
            label: getDisplayName("dataImportStatus", s, t) ?? "",
            value: s.toString(),
          };
        }
      })
      .sort((a, b) => (a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1));
    return options;
  }, [t]);

  const selectedStatus =
    selectedStatusId === undefined
      ? statusOptions[0]
      : statusOptions.find((s: any) => s.value === selectedStatusId.toString());

  return (
    <Select
      label={t("Import status")}
      value={selectedStatus}
      multiple={false}
      options={statusOptions}
      withResetValue={false}
      onChange={e => {
        if (e.value.toString() === "0") {
          setSelectedStatusId(undefined);
        } else {
          setSelectedStatusId(e.value as DataImportStatus);
        }
      }}
      doSort={false}
    />
  );
};
