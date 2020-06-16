import * as React from "react";
import { Grid, Typography } from "@material-ui/core";
import { SubPoolCard } from "ui/components/sub-pools/sub-pool-card";
import { BlockedSubPool } from "ui/components/sub-pools/blocked-sub-pool";
import { SubstitutePicker } from "ui/components/sub-pools/substitute-picker";
import { makeStyles } from "@material-ui/styles";
import {
  PermissionEnum,
  ReplacementPoolMemberUpdateInput,
  ReplacementPoolMember,
} from "graphql/server-types.gen";

type Props = {
  favoriteHeading: string;
  blockedHeading: string;
  autoAssignHeading?: string;
  searchHeading: string;
  favoriteMembers: ReplacementPoolMember[];
  blockedMembers: ReplacementPoolMember[];
  autoAssignMembers?: ReplacementPoolMember[];
  orgId: string;
  onRemoveFavoriteEmployee: (member: ReplacementPoolMember) => void;
  onRemoveBlockedEmployee: (member: ReplacementPoolMember) => void;
  onRemoveAutoAssignedEmployee?: (member: ReplacementPoolMember) => void;
  onAddFavoriteEmployee: (member: ReplacementPoolMember) => void;
  onBlockEmployee: (member: ReplacementPoolMember) => void;
  onAutoAssignEmployee?: (member: ReplacementPoolMember) => void;
  onAddNote: (replacementPoolMember: ReplacementPoolMemberUpdateInput) => void;
  removeBlockedPermission: PermissionEnum[];
  removeFavoritePermission: PermissionEnum[];
  addToBlockedPermission: PermissionEnum[];
  addToFavoritePermission: PermissionEnum[];
  useAutoAssign: boolean;
} & (
  | { heading: string; subHeading?: string }
  | { headerComponent: JSX.Element }
);

export const SubstitutePreferences: React.FC<Props> = props => {
  const classes = useStyles();

  const takenSubs =
    props.autoAssignMembers === undefined
      ? props.favoriteMembers.concat(props.blockedMembers)
      : props.favoriteMembers.concat(props.blockedMembers).concat(
          props.autoAssignMembers.map(
            x =>
              ({
                employeeId: x.employeeId,
                employee: {
                  firstName: x.employee?.firstName,
                  lastName: x.employee?.lastName,
                  id: x.employeeId,
                },
              } as ReplacementPoolMember)
          )
        );

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
              title={props.favoriteHeading}
              replacementPoolMembers={props.favoriteMembers}
              onRemove={props.onRemoveFavoriteEmployee}
              removePermission={props.removeFavoritePermission}
            />
          </Grid>
          <Grid item xs={12}>
            <BlockedSubPool
              title={props.blockedHeading}
              replacementPoolMembers={props.blockedMembers}
              onAddNote={props.onAddNote}
              onRemove={props.onRemoveBlockedEmployee}
              removePermission={props.removeBlockedPermission}
            />
          </Grid>
          {props.useAutoAssign && props.onRemoveAutoAssignedEmployee && (
            <Grid item xs={12}>
              <SubPoolCard
                title={props.autoAssignHeading ?? ""} // Auto Assign List?
                replacementPoolMembers={props.autoAssignMembers}
                onRemove={props.onRemoveAutoAssignedEmployee}
                removePermission={props.removeBlockedPermission}
              />
            </Grid>
          )}
        </Grid>
        <Grid item xs={6}>
          <SubstitutePicker
            useAutoAssign={props.useAutoAssign}
            orgId={props.orgId}
            title={props.searchHeading}
            onAdd={props.onAddFavoriteEmployee}
            onBlock={props.onBlockEmployee}
            onAutoAssign={props.onAutoAssignEmployee}
            takenSubstitutes={takenSubs}
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
