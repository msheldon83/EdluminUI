import * as React from "react";
import { Grid, Typography } from "@material-ui/core";
import { SubPoolCard } from "ui/components/sub-pools/subpoolcard";
import { SubstitutePicker } from "ui/components/sub-pools/substitute-picker";
import { makeStyles } from "@material-ui/styles";
import { PermissionEnum } from "graphql/server-types.gen";

type Props = {
  favoriteHeading: string;
  blockedHeading: string;
  autoAssignHeading?: string;
  searchHeading: string;
  favoriteEmployees: any[];
  blockedEmployees: any[];
  autoAssignEmployees?: any[] | null | undefined;
  heading: string;
  subHeading: string;
  orgId: string;
  onRemoveFavoriteEmployee: (orgUser: any) => void;
  onRemoveBlockedEmployee: (orgUser: any) => void;
  onRemoveAutoAssignedEmployee?: (orgUser: any) => void | null | undefined;
  onAddFavoriteEmployee: (orgUser: any) => void;
  onBlockEmployee: (orgUser: any) => void;
  onAutoAssignEmployee?: (orgUser: any) => void | null | undefined;
  removeBlockedPermission: PermissionEnum[];
  removeFavoritePermission: PermissionEnum[];
  addToBlockedPermission: PermissionEnum[];
  addToFavoritePermission: PermissionEnum[];
  isLocationOnly: boolean;
};

export const SubstitutePreferences: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <>
      <Typography variant="h5">{props.subHeading}</Typography>
      <Typography variant="h1">{props.heading}</Typography>
      <Grid container spacing={2} className={classes.content}>
        <Grid item xs={6}>
          <Grid item xs={12}>
            <SubPoolCard
              title={props.favoriteHeading}
              blocked={false}
              orgUsers={props.favoriteEmployees}
              onRemove={props.onRemoveFavoriteEmployee}
              removePermission={props.removeFavoritePermission}
            ></SubPoolCard>
          </Grid>
          <Grid item xs={12}>
            <SubPoolCard
              title={props.blockedHeading}
              blocked={true}
              orgUsers={props.blockedEmployees}
              onRemove={props.onRemoveBlockedEmployee}
              removePermission={props.removeBlockedPermission}
            ></SubPoolCard>
          </Grid>
          {props.isLocationOnly && (
            <Grid item xs={12}>
              <SubPoolCard
                title={props.autoAssignHeading ?? ""} // Auto Assign List?
                blocked={false}
                orgUsers={props.autoAssignEmployees}
                onRemove={props.onRemoveAutoAssignedEmployee}
                removePermission={props.removeBlockedPermission}
              ></SubPoolCard>
            </Grid>
          )}
        </Grid>
        <Grid item xs={6}>
          <SubstitutePicker
            isLocationOnly={props.isLocationOnly}
            orgId={props.orgId}
            title={props.searchHeading}
            onAdd={props.onAddFavoriteEmployee}
            onBlock={props.onBlockEmployee}
            onAutoAssign={props.onAutoAssignEmployee}
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
