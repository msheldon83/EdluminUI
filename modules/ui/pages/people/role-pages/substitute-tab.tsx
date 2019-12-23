import * as React from "react";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";

import { OrgUserRole, OrgUserUpdateInput } from "graphql/server-types.gen";
import { GetSubstituteById } from "../graphql/substitute/get-substitute-by-id.gen";
import { UpdateSubstitute } from "../graphql/substitute/update-substitute.gen";

import { SubstitutePools } from "../components/substitute/substitute-pools";
import { SubPositionsAttributes } from "../components/substitute/sub-positions-attributes";
import { OrganizationList } from "../components/substitute/org-list";
import { Information } from "../components/information";

type Props = {
  editing: string | null;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  selectedRole: OrgUserRole;
  orgUserId: string;
};

export const SubstituteTab: React.FC<Props> = props => {
  const { openSnackbar } = useSnackbar();

  const [updateSubstitute] = useMutationBundle(UpdateSubstitute, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const getSubstitute = useQueryBundle(GetSubstituteById, {
    variables: { id: props.orgUserId },
  });

  const orgUser =
    getSubstitute.state === "LOADING"
      ? undefined
      : getSubstitute?.data?.orgUser?.byId;

  if (getSubstitute.state === "LOADING" || !orgUser?.substitute) {
    return <></>;
  }

  const substitute = orgUser.substitute;

  const onUpdateSubstitute = async (updatedSubstitute: OrgUserUpdateInput) => {
    await updateSubstitute({
      variables: {
        orgUser: updatedSubstitute,
      },
    });
    props.setEditing(null);
  };

  return (
    <>
      <Information
        editing={props.editing}
        orgUser={substitute}
        userId={orgUser?.userId}
        loginEmail={orgUser?.loginEmail}
        isSuperUser={false}
        setEditing={props.setEditing}
        selectedRole={props.selectedRole}
        onSaveOrgUser={onUpdateSubstitute}
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
    </>
  );
};
