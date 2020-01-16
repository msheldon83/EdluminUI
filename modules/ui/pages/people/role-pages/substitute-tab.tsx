import * as React from "react";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";

import { OrgUserRole, SubstituteInput } from "graphql/server-types.gen";
import { GetSubstituteById } from "../graphql/substitute/get-substitute-by-id.gen";
import { SaveSubstitute } from "../graphql/substitute/save-substitute.gen";

import { SubstitutePools } from "../components/substitute/substitute-pools";
import { SubPositionsAttributes } from "../components/substitute/sub-positions-attributes";
import { OrganizationList } from "../components/substitute/org-list";
import { Information } from "../components/information";

import { SubstituteAssignmentsListView } from "ui/components/substitutes/substitute-assignments-list";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { useMemo } from "react";
import { SectionHeader } from "ui/components/section-header";
import { Section } from "ui/components/section";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { useIsAdmin } from "reference-data/is-admin";
import {
  SubstituteAssignmentScheduleListViewRoute,
  PersonViewRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";

type Props = {
  editing: string | null;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  selectedRole: OrgUserRole;
  orgUserId: string;
};

export const SubstituteTab: React.FC<Props> = props => {
  const { openSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const history = useHistory();
  let userIsAdmin = useIsAdmin();
  userIsAdmin = userIsAdmin === null ? false : userIsAdmin;
  const params = useRouteParams(PersonViewRoute);
  const [updateSubstitute] = useMutationBundle(SaveSubstitute, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const getSubstitute = useQueryBundle(GetSubstituteById, {
    variables: { id: props.orgUserId },
  });

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

  if (getSubstitute.state === "LOADING" || !orgUser?.substitute) {
    return <></>;
  }

  const substitute = orgUser.substitute;

  const onUpdateSubstitute = async (orgUser: SubstituteInput) => {
    await updateSubstitute({
      variables: {
        substitute: orgUser,
      },
    });
    props.setEditing(null);
    await getSubstitute.refetch();
  };

  return (
    <>
      <Information
        editing={props.editing}
        orgUser={substitute}
        permissionSet={substitute.permissionSet}
        userId={orgUser?.userId}
        loginEmail={orgUser?.loginEmail}
        isSuperUser={false}
        setEditing={props.setEditing}
        selectedRole={props.selectedRole}
        onSubmit={onUpdateSubstitute}
      />
      <SubPositionsAttributes
        editing={props.editing}
        attributes={substitute.attributes?.map(ee => ee?.endorsement) ?? []}
        qualifiedPositionTypes={substitute.qualifiedPositionTypes}
      />
      <SubstitutePools
        editing={props.editing}
        substitutePoolMembership={substitute.substitutePoolMembership}
      />
      <OrganizationList
        editing={props.editing}
        orgs={orgUser.relatedOrganizations}
      />
      {endDate && (
        <Section>
          <SectionHeader
            title={t("Upcoming Assignments")}
            action={{
              text: t("View All"),
              visible: true,
              execute: () => {
                const viewAllAssignmentsScheduleUrl = SubstituteAssignmentScheduleListViewRoute.generate(
                  params
                );
                history.push(viewAllAssignmentsScheduleUrl);
              },
            }}
          />
          <SubstituteAssignmentsListView
            userId={orgUser?.userId?.toString()}
            orgId={substitute.orgId.toString()}
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
