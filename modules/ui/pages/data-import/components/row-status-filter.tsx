import * as React from "react";
import { useMemo } from "react";
import { Select } from "ui/components/form/select";
import { useTranslation } from "react-i18next";
import { DataImportRowStatus } from "graphql/server-types.gen";
import { getDisplayName } from "ui/components/enumHelpers";
import { makeStyles } from "@material-ui/styles";

type Props = {
  selectedStatusId?: DataImportRowStatus;
  setSelectedStatusId: (statusId?: DataImportRowStatus) => void;
};

export const RowStatusFilter: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { setSelectedStatusId, selectedStatusId } = props;

  const statusOptions = useMemo(() => {
    const statuses = Object.values(DataImportRowStatus);

    const options = statuses
      .map(s => {
        if (s === DataImportRowStatus.Invalid) {
          return { label: t("(All)"), value: "0" };
        } else {
          return {
            label: getDisplayName("dataImportRowStatus", s, t) ?? "",
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
    <div className={classes.container}>
      <div className={classes.label}>{t("Row status")}</div>
      <Select
        value={selectedStatus}
        multiple={false}
        options={statusOptions}
        withResetValue={false}
        onChange={e => {
          if (e.value.toString() === "0") {
            setSelectedStatusId(undefined);
          } else {
            setSelectedStatusId(e.value as DataImportRowStatus);
          }
        }}
        doSort={false}
      />
    </div>
  );
};

export const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    paddingBottom: theme.spacing(2),
    alignItems: "center",
  },
  label: {
    paddingRight: theme.spacing(1),
  },
}));
