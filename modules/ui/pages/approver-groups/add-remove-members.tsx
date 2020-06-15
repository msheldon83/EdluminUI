import * as React from "react";
import { Grid, Typography } from "@material-ui/core";
import { PermissionEnum, OrgUserRole } from "graphql/server-types.gen";
import { MemberViewCard } from "./components/member-view-card";
import { AdminPicker } from "./components/admin-picker";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useHistory } from "react-router";
import { makeStyles } from "@material-ui/styles";
import { useRouteParams } from "ui/routes/definition";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { Link } from "react-router-dom";
import { PageTitle } from "ui/components/page-title";
import { GetSuggestedAdmins } from "./graphql/get-suggested-admins.gen";
import { GetApproverGroupById } from "./graphql/get-approver-group-by-id.gen";
import { compact } from "lodash-es";
import { useTranslation } from "react-i18next";
import { RemoveMember } from "./graphql/remove-member.gen";
import {
  ApproverGroupsRoute,
  ApproverGroupAddLocationsRoute,
} from "ui/routes/approver-groups";
import { LocationViewRoute } from "ui/routes/locations";
import { AddMember } from "./graphql/add-member.gen";
import { GetAdminsByName } from "./graphql/get-admins-by-name.gen";
import { ApproverGroupAddRemoveMembersRoute } from "ui/routes/approver-groups";
import { WorkflowViewCard } from "./components/workflow-view-card";

type OptionType = {
  label: string;
  value?: string;
}[];

export const ApproverGroupAddRemoveMemberPage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(ApproverGroupAddRemoveMembersRoute);

  const [searchText, setSearchText] = React.useState<string | undefined>();

  const [removeMember] = useMutationBundle(RemoveMember, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    refetchQueries: ["GetApproverGroupById"],
  });

  const [addMember] = useMutationBundle(AddMember, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    refetchQueries: ["GetApproverGroupById"],
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
    setSearchText(searchText);
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

  const getApproverGroup = useQueryBundle(GetApproverGroupById, {
    variables: { approverGroupId: params.approverGroupId },
  });

  const getAdminByName = useQueryBundle(GetAdminsByName, {
    variables: { name: searchText, orgId: params.organizationId },
    skip: !searchText,
  });

  const allSuggestedAdminsQuery = useQueryBundle(GetSuggestedAdmins, {
    variables: {
      orgId: params.organizationId,
    },
  });

  const approverGroup =
    getApproverGroup.state === "LOADING"
      ? undefined
      : getApproverGroup?.data?.approverGroup?.groupById;

  if (
    getApproverGroup.state === "LOADING" ||
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
      qResults?.filter(i => {
        return !approverGroup?.approverGroupMembers?.find(
          x => x?.orgUser?.id === i.id
        );
      }) ?? [];
  }

  const searchedAdmins =
    getAdminByName.state === "LOADING"
      ? []
      : compact(getAdminByName?.data?.orgUser?.all?.filter(e => e?.isAdmin));

  const admins =
    searchText === "" || searchText === undefined
      ? suggestedAdmins
      : searchedAdmins;

  const groupMembers =
    compact(
      approverGroup?.approverGroupMembers?.map(x => {
        return {
          label: `${x?.orgUser?.firstName} ${x?.orgUser?.lastName ?? ""}`,
          value: x?.orgUser?.id ?? "",
        };
      })
    ) ?? [];

  const approvalWorkflows = compact(
    approverGroup?.approvalWorkflows?.map(e => {
      return { value: e?.id, label: e?.name ?? "" };
    })
  );

  //Check state first on location
  const locationId = history.location.state?.locationId;
  const to = locationId
    ? LocationViewRoute.generate({
        locationId: locationId,
        organizationId: params.organizationId,
      })
    : approverGroup?.location
    ? ApproverGroupAddLocationsRoute.generate({
        approverGroupHeaderId: approverGroup?.approverGroupHeaderId ?? "",
        organizationId: params.organizationId,
      })
    : ApproverGroupsRoute.generate({ organizationId: params.organizationId });

  const linkText = approverGroup?.location
    ? t("Return to Locations")
    : t("Return to Approver Groups");

  return (
    <>
      <div className={classes.headerLink}>
        <Typography variant="h5">
          {approverGroup?.location?.name ?? t("Approver Group")}
        </Typography>
        <div className={classes.linkPadding}>
          <Link to={to} className={classes.link}>
            {linkText}
          </Link>
        </div>
      </div>
      <PageTitle title={approverGroup?.name ?? t("Approver Group")} />
      <Grid container spacing={2} className={classes.content}>
        <Grid item xs={6}>
          <Grid item xs={12}>
            <MemberViewCard
              title={t("Members")}
              values={groupMembers}
              onRemove={onRemoveMember}
              savePermissions={[PermissionEnum.ApprovalSettingsSave]}
            />
          </Grid>
          <Grid item xs={12}>
            <WorkflowViewCard
              title={t("Referenced by")}
              values={approvalWorkflows}
            />
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <AdminPicker
            onAdd={onAddMember}
            admins={admins}
            setSearchText={setSearchText}
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
  headerLink: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  link: {
    color: theme.customColors.blue,
    "&:visited": {
      color: theme.customColors.blue,
    },
  },
  linkPadding: {
    paddingRight: theme.spacing(2),
  },
}));
