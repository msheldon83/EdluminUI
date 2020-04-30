import * as React from "react";
import { Grid, Typography } from "@material-ui/core";
import { SubPoolCard } from "ui/components/sub-pools/subpoolcard";
import { SubstitutePicker } from "ui/components/sub-pools/substitute-picker";
import { makeStyles } from "@material-ui/styles";
import { PermissionEnum, OrgUser } from "graphql/server-types.gen";

type Props = {
  favoriteHeading: string;
  blockedHeading: string;
  autoAssignHeading?: string;
  searchHeading: string;
  favoriteEmployees: OrgUser[];
  blockedEmployees: OrgUser[];
  autoAssignEmployees?: OrgUser[];
  orgId: string;
  onRemoveFavoriteEmployee: (orgUser: OrgUser) => void;
  onRemoveBlockedEmployee: (orgUser: OrgUser) => void;
  onRemoveAutoAssignedEmployee?: (orgUser: OrgUser) => void;
  onAddFavoriteEmployee: (orgUser: OrgUser) => void;
  onBlockEmployee: (orgUser: OrgUser) => void;
  onAutoAssignEmployee?: (orgUser: OrgUser) => void;
  removeBlockedPermission: PermissionEnum[];
  removeFavoritePermission: PermissionEnum[];
  addToBlockedPermission: PermissionEnum[];
  addToFavoritePermission: PermissionEnum[];
  isLocationOnly: boolean;
} & (
  | { heading: string; subHeading?: string }
  | { headerComponent: JSX.Element }
);

export const SubstitutePreferences: React.FC<Props> = props => {
  const classes = useStyles();

  const takenSubs = () => {
    if (props.autoAssignEmployees === undefined) {
      return props.favoriteEmployees.concat(props.blockedEmployees);
    }
    return props.favoriteEmployees
      .concat(props.blockedEmployees)
      .concat(props.autoAssignEmployees);
  };

  const header =
    "headerComponent" in props ? (
      props.headerComponent
    ) : (
      <>
        {props.subHeading && (
          <Typography variant="h5">{props.subHeading}</Typography>
        )}
        <Typography variant="h1">{props.heading}</Typography>
      </>
    );

  return (
    <>
      {header}
      <Grid container spacing={2} className={classes.content}>
        <Grid item xs={6}>
          <Grid item xs={12}>
            <SubPoolCard
              orgId={props.orgId}
              title={props.favoriteHeading}
              blocked={false}
              orgUsers={props.favoriteEmployees}
              onRemove={props.onRemoveFavoriteEmployee}
              removePermission={props.removeFavoritePermission}
            ></SubPoolCard>
          </Grid>
          <Grid item xs={12}>
            <SubPoolCard
              orgId={props.orgId}
              title={props.blockedHeading}
              blocked={true}
              orgUsers={props.blockedEmployees}
              onRemove={props.onRemoveBlockedEmployee}
              removePermission={props.removeBlockedPermission}
            ></SubPoolCard>
          </Grid>
          {props.isLocationOnly && props.onRemoveAutoAssignedEmployee && (
            <Grid item xs={12}>
              <SubPoolCard
                orgId={props.orgId}
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
            takenSubstitutes={takenSubs()}
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
