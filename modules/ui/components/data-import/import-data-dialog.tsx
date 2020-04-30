import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
import { ImportDataForm } from "./import-data-form";
import { DataImportType } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";

type Props = {
  orgId: string;
  open: boolean;
  onClose: () => void;
  importType?: DataImportType;
};

export const ImportDataDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullWidth={true}
      maxWidth={"md"}
    >
      <DialogTitle>{t("Import data")}</DialogTitle>
      <DialogContent>
        <ImportDataForm
          orgId={props.orgId}
          onClose={props.onClose}
          importType={props.importType}
        />
      </DialogContent>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({}));
