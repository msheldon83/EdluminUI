import * as React from "react";
import { Grid, Typography } from "@material-ui/core";
import { SubPoolCard } from "ui/components/sub-pools/subpoolcard";
import { SubstitutePicker } from "ui/components/sub-pools/substitute-picker";
import { makeStyles } from "@material-ui/styles";
import { PermissionEnum } from "graphql/server-types.gen";

type Props = {
  favoriteHeading: string;
  blockedHeading: string;
  searchHeading: string;
  favoriteEmployees: any[];
  blockedEmployees: any[];
  heading: string;
  subHeading?: string;
  orgId: string;
  onRemoveFavoriteEmployee: (orgUser: any) => void;
  onRemoveBlockedEmployee: (orgUser: any) => void;
  onAddFavoriteEmployee: (orgUser: any) => void;
  onBlockEmployee: (orgUser: any) => void;
  removeBlockedPermission: PermissionEnum[];
  removeFavoritePermission: PermissionEnum[];
  addToBlockedPermission: PermissionEnum[];
  addToFavoritePermission: PermissionEnum[];
};

export const SubstitutePreferences: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <>
      {props.subHeading && (
        <Typography variant="h5">{props.subHeading}</Typography>
      )}
      <Typography variant="h1">{props.heading}</Typography>
      <Grid container spacing={2} className={classes.content}>
        <Grid item md={6} xs={12}>
          <SubPoolCard
            title={props.favoriteHeading}
            blocked={false}
            orgUsers={props.favoriteEmployees}
            onRemove={props.onRemoveFavoriteEmployee}
            removePermission={props.removeFavoritePermission}
          ></SubPoolCard>
        </Grid>
        <Grid item md={6} xs={12}>
          <SubPoolCard
            title={props.blockedHeading}
            blocked={true}
            orgUsers={props.blockedEmployees}
            onRemove={props.onRemoveBlockedEmployee}
            removePermission={props.removeBlockedPermission}
          ></SubPoolCard>
        </Grid>
        <Grid item xs={12}>
          <SubstitutePicker
            orgId={props.orgId}
            title={props.searchHeading}
            onAdd={props.onAddFavoriteEmployee}
            onBlock={props.onBlockEmployee}
            takenSubstitutes={props.favoriteEmployees.concat(
              props.blockedEmployees
            )}
            addToBlockedPermission={props.addToBlockedPermission}
            addToFavoritePermission={props.addToFavoritePermission}
          ></SubstitutePicker>
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
