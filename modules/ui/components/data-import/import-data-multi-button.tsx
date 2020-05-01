import * as React from "react";
import { useTranslation } from "react-i18next";
import { MenuButton, Option } from "ui/components/menu-button";
import { useState } from "react";
import { DataImportType } from "graphql/server-types.gen";
import { ImportDataDialog } from "./import-data-dialog";
import { Can } from "ui/components/auth/can";
import { canImportData } from "helpers/permissions";
import { useIsMobile } from "hooks";

type Props = {
  orgId: string;
  importTypes: {
    importType: DataImportType;
    label: string;
  }[];
  className?: string;
};

export const ImportDataMultiButton: React.FC<Props> = props => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [importType, setImportType] = useState<DataImportType | undefined>(
    undefined
  );

  const onClose = () => {
    setOpen(false);
    setImportType(undefined);
  };

  const options = props.importTypes.map(
    x =>
      ({
        name: x.label,
        onClick: () => {
          setImportType(x.importType);
          setOpen(true);
        },
      } as Option)
  );
  options.unshift({ name: t("Import") } as Option);

  return isMobile ? (
    <></>
  ) : (
    <Can do={canImportData} orgId={props.orgId}>
      <ImportDataDialog
        open={open}
        importType={importType}
        orgId={props.orgId}
        onClose={onClose}
      />

      <MenuButton selectedIndex={0} options={options} variant={"outlined"} />
    </Can>
  );
};
