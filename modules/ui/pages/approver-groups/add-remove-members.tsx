import * as React from "react";
import { Grid } from "@material-ui/core";
import { PermissionEnum } from "graphql/server-types.gen";
import { ViewCard } from "./components/view-card";
import { AdminPicker } from "./components/admin-picker";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { makeStyles } from "@material-ui/styles";
import { useRouteParams } from "ui/routes/definition";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { GetSuggestedAdmins } from "./graphql/get-suggested-admins.gen";
import { GetApproverGroupMembers } from "./graphql/get-approver-group-members.gen";
import { compact } from "lodash-es";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { RemoveMember } from "./graphql/remove-member.gen";
import { AddMember } from "./graphql/add-member.gen";
import { ApproverGroupAddRemoveMembersRoute } from "ui/routes/approver-groups";

type OptionType = {
  label: string;
  value?: string;
}[];

export const ApproverGroupAddRemoveMemberPage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(ApproverGroupAddRemoveMembersRoute);

  const [removeMember] = useMutationBundle(RemoveMember, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [addMember] = useMutationBundle(AddMember, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onAddMember = async (orgUserId: string) => {
    await addMember({
      variables: {
        member: {
          orgId: params.organizationId,
          approverGroupId: params.approverGroupId,
          orgUserId: orgUserId,
        },
      },
    });
  };

  const onRemoveMember = async (orgUserId: string) => {
    await removeMember({
      variables: {
        member: {
          approverGroupId: params.approverGroupId,
          orgUserId: orgUserId,
        },
      },
    });
  };

  const getApproverGroups = useQueryBundle(GetApproverGroupMembers, {
    variables: { id: params.approverGroupId },
  });

  const allSuggestedAdminsQuery = useQueryBundle(GetSuggestedAdmins, {
    variables: {
      orgId: params.organizationId,
    },
  });

  const approverGroups =
    getApproverGroups.state === "LOADING"
      ? undefined
      : getApproverGroups?.data?.approverGroup?.byId?.approverGroups;

  if (
    getApproverGroups.state === "LOADING" ||
    allSuggestedAdminsQuery.state === "LOADING"
  ) {
    return <></>;
  }

  let suggestedAdmins: GetSuggestedAdmins.SuggestedAdminsForApproverGroups[] = [];

  const qResults = compact(
    allSuggestedAdminsQuery?.data?.orgUser?.suggestedAdminsForApproverGroups
  );

  if (qResults) {
    suggestedAdmins =
      qResults.filter(i => {
        return !approverGroups?.map(ignored => {
          return ignored?.approverGroupMembers.filter(
            x => x?.orgUser?.id === i.id
          );
        });
      }) ?? [];
  }

  const allGroupMembers =
    approverGroups?.map(e => {
      return e?.approverGroupMembers?.map(x => {
        return {
          label: x?.orgUser?.firstName + " " + x?.orgUser?.lastName ?? "",
          value: x?.orgUser?.id ?? "",
        };
      });
    }) ?? [];

  const workflows: OptionType = [];

  return (
    <>
      {/* ///NEEDS CUSTOM HEADER/// */}
      <Grid container spacing={2} className={classes.content}>
        <Grid item xs={6}>
          <Grid item xs={12}>
            <ViewCard
              title={t("Members")}
              values={allGroupMembers}
              onRemove={onRemoveMember}
              savePermissions={[PermissionEnum.ApprovalSettingsSave]}
            />
          </Grid>
          <Grid item xs={12}>
            <ViewCard title={t("Referenced by")} values={workflows} />
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <AdminPicker
            onAdd={onAddMember}
            suggestedAdmins={suggestedAdmins}
            savePermissions={[PermissionEnum.ApprovalSettingsSave]}
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
