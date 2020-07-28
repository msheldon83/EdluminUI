import * as React from "react";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import {
  OrgUserRole,
  SubstituteInput,
  PermissionEnum,
  OrganizationRelationshipType,
  DiscussionSubjectType,
  ObjectType,
} from "graphql/server-types.gen";
import { GetSubstituteById } from "../graphql/substitute/get-substitute-by-id.gen";
import { SaveSubstitute } from "../graphql/substitute/save-substitute.gen";
import { SubstitutePools } from "../components/substitute/substitute-pools";
import { SubPayInformation } from "../components/substitute/pay-information";
import { useOrganization } from "reference-data/organization";
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
import { Can } from "ui/components/auth/can";
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

  const getOrgRelationships = useOrganizationRelationships(
    params.organizationId
  );

  const getOrganization = useOrganization(params.organizationId);
  const includeRelatedOrgs = getOrganization?.isStaffingProvider;
  const staffingOrgId = includeRelatedOrgs ? params.organizationId : undefined;

  const showRelatedOrgs = getOrgRelationships?.find(
    x => x?.relationshipType === OrganizationRelationshipType.Services
  )
    ? true
    : false;

  const getSubstitute = useQueryBundle(GetSubstituteById, {
    variables: { id: props.orgUserId, includeRelatedOrgs: showRelatedOrgs },
    skip: includeRelatedOrgs === undefined,
  });

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

  const refetchQuery = () => {
    getSubstitute.refetch();
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
      <Can do={[PermissionEnum.SubstituteView]} orgId={params.organizationId}>
        <Comments
          refetchQuery={refetchQuery}
          staffingOrgId={staffingOrgId}
          comments={orgUser.substitute.comments ?? []}
          userId={orgUser.userId ?? ""}
          discussionSubjectType={DiscussionSubjectType.Substitute}
          objectType={ObjectType.User}
          orgId={params.organizationId}
        />
      </Can>
      <SubPositionsAttributes
        editing={props.editing}
        editable={canEditThisSub}
        attributes={
          substitute.attributes?.map(a => {
            return {
              endorsementName: a.endorsement?.name,
              expirationDate: a.expirationDate,
            };
          }) ?? []
        }
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
