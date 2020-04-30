import * as React from "react";
import { Button, makeStyles } from "@material-ui/core";
import { useState } from "react";
import { DataImportType } from "graphql/server-types.gen";
import { ImportDataDialog } from "./import-data-dialog";
import { Can } from "ui/components/auth/can";
import { canViewDataManagementNavLink } from "helpers/permissions";

type Props = {
  orgId: string;
  importType?: DataImportType;
  label: string;
  className?: string;
};

export const ImportDataButton: React.FC<Props> = props => {
  const [open, setOpen] = useState(false);
  const classes = useStyles();

  const onClose = () => {
    setOpen(false);
  };

  return (
    <Can do={canViewDataManagementNavLink} orgId={props.orgId}>
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
      >
        {props.label}
      </Button>
    </Can>
  );
};

export const useStyles = makeStyles(theme => ({}));
