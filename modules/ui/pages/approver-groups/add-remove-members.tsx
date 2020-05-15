import * as React from "react";
import { Grid, Typography } from "@material-ui/core";
import { SubPoolCard } from "ui/components/sub-pools/subpoolcard";
import { AdminPicker } from "./components/admin-picker";
import { makeStyles } from "@material-ui/styles";

export const ApproverGroupAddRemoveMemberPage: React.FC<{}> = props => {
  const classes = useStyles();

  ///NEEDS CUSTOM HEADER
  return (
    <>
      <Grid container spacing={2} className={classes.content}>
        <Grid item xs={6}>
          <Grid item xs={12}>
            <SubPoolCard
              title={props.favoriteHeading}
              orgUsers={props.favoriteEmployees}
              onRemove={props.onRemoveFavoriteEmployee}
              removePermission={props.removeFavoritePermission}
            ></SubPoolCard>
          </Grid>
          <Grid item xs={12}>
            <SubPoolCard
              title={props.blockedHeading}
              orgUsers={props.blockedEmployees}
              onRemove={props.onRemoveBlockedEmployee}
              removePermission={props.removeBlockedPermission}
            ></SubPoolCard>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          {/* <AdminPicker      
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
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  content: {
    marginTop: theme.spacing(2),
  },
}));
