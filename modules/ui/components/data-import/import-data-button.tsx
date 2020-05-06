import * as React from "react";
import { Button, makeStyles } from "@material-ui/core";
import { useState } from "react";
import { DataImportType, PermissionEnum } from "graphql/server-types.gen";
import { ImportDataDialog } from "./import-data-dialog";
import { Can } from "ui/components/auth/can";
import { useIsMobile } from "hooks";

type Props = {
  orgId: string;
  importType?: DataImportType;
  label: string;
  className?: string;
  fullWidth?: boolean;
};

export const ImportDataButton: React.FC<Props> = props => {
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const isMobile = useIsMobile();

  const onClose = () => {
    setOpen(false);
  };

  return isMobile ? (
    <></>
  ) : (
    <Can do={[PermissionEnum.DataImport]} orgId={props.orgId}>
      <ImportDataDialog
        open={open}
        importType={props.importType}
        orgId={props.orgId}
        onClose={onClose}
      />

      <Button
        variant="outlined"
        onClick={() => setOpen(true)}
        className={props.className}
        fullWidth={props.fullWidth}
      >
        {props.label}
      </Button>
    </Can>
  );
};

export const useStyles = makeStyles(theme => ({}));
