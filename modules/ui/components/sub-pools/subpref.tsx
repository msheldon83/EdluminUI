import * as React from "react";
import { Grid, Typography } from "@material-ui/core";
import { SubPoolCard } from "ui/components/sub-pools/sub-pool-card";
import { BlockedSubPool } from "ui/components/sub-pools/blocked-sub-pool";
import { SubstitutePicker } from "ui/components/sub-pools/substitute-picker";
import { makeStyles } from "@material-ui/styles";
import {
  PermissionEnum,
  ReplacementPoolMemberUpdateInput,
} from "graphql/server-types.gen";
import { BlockedPoolMember, PoolMember } from "./types";

type Props = {
  favoriteHeading: string;
  blockedHeading: string;
  searchHeading: string;
  favoriteMembers: PoolMember[];
  blockedMembers: BlockedPoolMember[];
  orgId: string;
  onRemoveFavoriteEmployee: (member: PoolMember) => void;
  onRemoveBlockedEmployee: (member: BlockedPoolMember) => void;
  onAddFavoriteEmployee: (member: PoolMember) => void;
  onBlockEmployee: (member: PoolMember) => void;
  onAddNote: (replacementPoolMember: ReplacementPoolMemberUpdateInput) => void;
  removeBlockedPermission: PermissionEnum[];
  removeFavoritePermission: PermissionEnum[];
  addToBlockedPermission: PermissionEnum[];
  addToFavoritePermission: PermissionEnum[];
  autoAssign?: {
    heading: string;
    members: PoolMember[];
    onRemove: (member: PoolMember) => void;
    onAdd: (member: PoolMember) => void;
    addPermission: PermissionEnum[];
    removePermission: PermissionEnum[];
  };
} & (
  | { heading: string; subHeading?: string }
  | { headerComponent: JSX.Element }
);

export const SubstitutePreferences: React.FC<Props> = props => {
  const classes = useStyles();

  const takenSubs: PoolMember[] = props.favoriteMembers
    .concat(props.blockedMembers)
    .concat(
      props.autoAssign?.members.map(x => ({
        employeeId: x.employeeId,
        employee: {
          firstName: x.employee?.firstName,
          lastName: x.employee?.lastName,
          id: x.employeeId,
        },
      })) ?? []
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
          {props.autoAssign && (
            <Grid item xs={12}>
              <SubPoolCard
                title={props.autoAssign.heading} // Auto Assign List?
                replacementPoolMembers={props.autoAssign.members}
                onRemove={props.autoAssign.onRemove}
                removePermission={props.autoAssign.removePermission}
              />
            </Grid>
          )}
        </Grid>
        <Grid item xs={6}>
          <SubstitutePicker
            orgId={props.orgId}
            title={props.searchHeading}
            onAdd={props.onAddFavoriteEmployee}
            onBlock={props.onBlockEmployee}
            takenSubstitutes={takenSubs}
            addToBlockedPermission={props.addToBlockedPermission}
            addToFavoritePermission={props.addToFavoritePermission}
            autoAssign={props.autoAssign}
          />
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
