import * as React from "react";
import { Grid, Typography } from "@material-ui/core";
import { SubPoolCard } from "ui/components/sub-pools/subpoolcard";
import { AdminPicker } from "./components/admin-picker";
import { makeStyles } from "@material-ui/styles";

export const ApproverGroupAdminsPage: React.FC<{}> = props => {
  const classes = useStyles();

  ///NEEDS CUSTOM HEADER
  return (
    <>
      <Grid item xs={6}>
        {/* <AdminPicker
          isLocationOnly={props.isLocationOnly}
          orgId={props.orgId}
          title={props.searchHeading}
          onAdd={props.onAddFavoriteEmployee}
          onBlock={props.onBlockEmployee}
          onAutoAssign={props.onAutoAssignEmployee}
          takenSubstitutes={takenSubs()}
          addToBlockedPermission={props.addToBlockedPermission}
          addToFavoritePermission={props.addToFavoritePermission}
        /> */}
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  content: {
    marginTop: theme.spacing(2),
  },
}));
