import * as React from "react";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import {
  OrgUserRole,
  SubstituteInput,
  PermissionEnum,
  OrganizationRelationshipType,
  CommentCreateInput,
  CommentUpdateInput,
  DiscussionSubjectType,
} from "graphql/server-types.gen";
import { GetSubstituteById } from "../graphql/substitute/get-substitute-by-id.gen";
import { SaveSubstitute } from "../graphql/substitute/save-substitute.gen";
import { CreateComment } from "../graphql/create-comment.gen";
import { UpdateComment } from "../graphql/update-comment.gen";
import { DeleteComment } from "../graphql/delete-comment.gen";
import { SubstitutePools } from "../components/substitute/substitute-pools";
import { SubPayInformation } from "../components/substitute/pay-information";
import { useOrganizationRelationships } from "reference-data/organization-relationships";
import { SubPositionsAttributes } from "../components/substitute/sub-positions-attributes";
import { OrganizationList } from "../components/substitute/org-list";
import { Information } from "../components/information";
import { SubstituteAssignmentsListView } from "ui/components/substitutes/substitute-assignments-list";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { usePayCodes } from "reference-data/pay-codes";
import { useMemo } from "react";
import { SectionHeader } from "ui/components/section-header";
import { Section } from "ui/components/section";
import { useTranslation } from "react-i18next";
import { Comments } from "../components/comments/index";
import { useHistory } from "react-router";
import { useIsAdmin } from "reference-data/is-admin";
import {
  SubstituteAssignmentScheduleListViewRoute,
  SubstituteAvailableAssignmentsRoute,
  PersonViewRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { GetOrganizationRelationships } from "../graphql/get-org-relationships.gen";
import { useCanDo } from "ui/components/auth/can";
import { canEditSub } from "helpers/permissions";

type Props = {
  editing: string | null;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  selectedRole: OrgUserRole;
  orgUserId: string;
};

export const SubstituteTab: React.FC<Props> = props => {
  const { openSnackbar } = useSnackbar();
  const canDoFn = useCanDo();
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PersonViewRoute);

  const [updateSubstitute] = useMutationBundle(SaveSubstitute, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [updateComment] = useMutationBundle(UpdateComment, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [addComment] = useMutationBundle(CreateComment, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [deleteComment] = useMutationBundle(DeleteComment, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const getSubstitute = useQueryBundle(GetSubstituteById, {
    variables: { id: props.orgUserId },
  });

  const getOrgRelationships = useOrganizationRelationships(
    params.organizationId
  );

  console.log(getOrgRelationships);

  const showRelatedOrgs = getOrgRelationships?.find(
    x => x?.relationshipType === OrganizationRelationshipType.Services
  )
    ? true
    : false;

  const getPayCodes = usePayCodes(params.organizationId);
  const payCodeOptions = useMemo(
    () => getPayCodes.map(c => ({ label: c.name, value: c.id })),
    [getPayCodes]
  );

  /*added for upcoming assignments*/

  const currentSchoolYear = useCurrentSchoolYear(params.organizationId);
  const startDate = useMemo(() => new Date(), []);
  const endDate = useMemo(
    () => new Date(currentSchoolYear?.endDate.toString()),
    [currentSchoolYear]
  );

  /* **************** */

  const orgUser =
    getSubstitute.state === "LOADING"
      ? undefined
      : getSubstitute?.data?.orgUser?.byId;

  let userIsAdmin = useIsAdmin(orgUser?.orgId);
  userIsAdmin = userIsAdmin === null ? false : userIsAdmin;

  const payCode = orgUser?.substitute?.payCode;

  if (getSubstitute.state === "LOADING" || !orgUser?.substitute) {
    return <></>;
  }

  const substitute = orgUser.substitute;
  const canEditThisSub = canDoFn(canEditSub, orgUser.orgId, orgUser);

  const onUpdateSubstitute = async (subInput: SubstituteInput) => {
    await updateSubstitute({
      variables: {
        substitute: {
          ...subInput,
          id: props.orgUserId,
          orgId: params.organizationId,
        },
      },
    });
    props.setEditing(null);
    await getSubstitute.refetch();
  };

  const onAddComment = async (comment: CommentCreateInput) => {
    await addComment({
      variables: {
        comment: comment,
      },
    });
    await getSubstitute.refetch();
  };

  const onEditComment = async (comment: CommentUpdateInput) => {
    await updateComment({
      variables: {
        comment: comment,
      },
    });
    await getSubstitute.refetch();
  };

  const onDeleteComment = async (id: string) => {
    await deleteComment({
      variables: {
        commentId: id,
      },
    });
    await getSubstitute.refetch();
  };

  return (
    <>
      <Information
        editing={props.editing}
        editable={canEditThisSub}
        orgUser={orgUser}
        permissionSet={substitute.permissionSet}
        userId={orgUser?.userId}
        loginEmail={orgUser?.loginEmail}
        isSuperUser={false}
        setEditing={props.setEditing}
        selectedRole={props.selectedRole}
        editPermissions={[PermissionEnum.SubstituteSave]}
        onSubmit={onUpdateSubstitute}
        temporaryPassword={orgUser?.temporaryPassword ?? undefined}
      />
      <Comments
        onAddComment={onAddComment}
        comments={orgUser.substitute.comments ?? []}
        discussionId={orgUser.replacementEmployeeDiscussionId ?? ""}
        orgUserId={orgUser.id}
        discussionSubjectType={DiscussionSubjectType.Substitute}
        onEditComment={onEditComment}
        onDeleteComment={onDeleteComment}
        orgId={params.organizationId}
      />
      <SubPositionsAttributes
        editing={props.editing}
        editable={canEditThisSub}
        attributes={substitute.attributes?.map(ee => ee?.endorsement) ?? []}
        qualifiedPositionTypes={substitute.qualifiedPositionTypes}
      />
      <SubPayInformation
        editing={props.editing}
        editable={canEditThisSub}
        setEditing={props.setEditing}
        editPermissions={[PermissionEnum.SubstituteSave]}
        onSubmit={onUpdateSubstitute}
        payCodeOptions={payCodeOptions}
        payCode={payCode}
      />
      <SubstitutePools
        editing={props.editing}
        substitutePoolMembership={substitute.substitutePoolMembership}
      />
      {showRelatedOrgs && (
        <OrganizationList
          editing={props.editing}
          orgs={orgUser.relatedOrganizations}
        />
      )}
      {endDate && (
        <Section>
          <SectionHeader
            title={t("Upcoming Assignments")}
            actions={[
              {
                text: t("View All"),
                visible: true,
                execute: () => {
                  const viewAllAssignmentsScheduleUrl = SubstituteAssignmentScheduleListViewRoute.generate(
                    params
                  );
                  history.push(viewAllAssignmentsScheduleUrl);
                },
              },
              {
                text: t("View available"),
                visible: true,
                execute: () => {
                  const viewAvailableAssignmentsUrl = SubstituteAvailableAssignmentsRoute.generate(
                    params
                  );
                  history.push(viewAvailableAssignmentsUrl);
                },
              },
            ]}
          />
          <SubstituteAssignmentsListView
            userId={orgUser?.userId}
            orgId={params.organizationId}
            startDate={startDate}
            endDate={endDate}
            limit={5}
            isAdmin={userIsAdmin}
          />
        </Section>
      )}
    </>
  );
};
