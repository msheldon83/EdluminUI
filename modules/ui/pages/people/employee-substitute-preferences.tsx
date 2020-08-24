import * as React from "react";
import { useTranslation } from "react-i18next";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { useRouteParams } from "ui/routes/definition";
import { EmployeeSubstitutePreferenceRoute } from "ui/routes/people";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetEmployeeSubPreferencesById } from "./graphql/employee/get-employee-sub-preferences.gen";
import { SaveEmployee } from "./graphql/employee/save-employee.gen";
import { SaveReplacementPoolMember } from "./graphql/employee/save-replacement-pool-member.gen";
import { AddSubPreference } from "./graphql/employee/add-sub-preference.gen";
import { RemoveSubPreference } from "./graphql/employee/remove-sub-preference.gen";
import { SubstitutePreferences } from "ui/components/sub-pools/subpref";
import {
  PermissionEnum,
  ReplacementPoolMember,
  ReplacementPoolMemberUpdateInput,
  ReplacementPoolType,
} from "graphql/server-types.gen";
import { PersonLinkHeader } from "ui/components/link-headers/person";

export const EmployeeSubstitutePreferencePage: React.FC<{}> = props => {
  const params = useRouteParams(EmployeeSubstitutePreferenceRoute);
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const getEmployee = useQueryBundle(GetEmployeeSubPreferencesById, {
    variables: { id: params.orgUserId },
    fetchPolicy: "cache-first",
  });

  const onRemoveFavoriteSubstitute = async (sub: any) => {
    await removeSub(sub.employeeId, ReplacementPoolType.Favorite);
  };

  const onRemoveBlockedSubstitute = async (sub: any) => {
    await removeSub(sub.employeeId, ReplacementPoolType.Blocked);
  };

  const onAddSubstitute = async (sub: any) => {
    orgUser?.employee?.substitutePreferences?.favoriteSubstituteMembers.push(
      sub
    );

    await addSub(sub.employeeId, ReplacementPoolType.Favorite);
  };

  const onBlockSubstitute = async (sub: any) => {
    orgUser?.employee?.substitutePreferences?.blockedSubstituteMembers.push(
      sub
    );

    await addSub(sub.employeeId, ReplacementPoolType.Blocked);
  };

  const onAddNote = async (
    replacementPoolMember: ReplacementPoolMemberUpdateInput
  ) => {
    const result = await updateReplacementPoolMember({
      variables: {
        replacementPoolMember: replacementPoolMember,
      },
    });
    if (!result?.data) return false;
    await getEmployee.refetch();
    return true;
  };

  const [addSubPreference] = useMutationBundle(AddSubPreference, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [removeSubPreference] = useMutationBundle(RemoveSubPreference, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const addSub = async (subId: string, type: ReplacementPoolType) => {
    const result = await addSubPreference({
      variables: {
        subPreference: {
          orgId: orgUser?.orgId ?? "",
          employee: { id: orgUser?.id },
          substitute: { id: subId },
          replacementPoolType: type,
        },
      },
    });
    if (!result.data) return false;
    await getEmployee.refetch();
    return true;
  };

  const removeSub = async (subId: string, type: ReplacementPoolType) => {
    const result = await removeSubPreference({
      variables: {
        subPreference: {
          orgId: orgUser?.orgId ?? "",
          employee: { id: orgUser?.id },
          substitute: { id: subId },
          replacementPoolType: type,
        },
      },
    });
    if (!result.data) return false;
    await getEmployee.refetch();
    return true;
  };

  const [updateReplacementPoolMember] = useMutationBundle(
    SaveReplacementPoolMember,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  if (getEmployee.state === "LOADING") {
    return <></>;
  }
  const orgUser = getEmployee?.data?.orgUser?.byId ?? undefined;
  const employee = orgUser?.employee ?? undefined;

  const headerComponent = (
    <PersonLinkHeader
      title={t("Substitute Preferences")}
      person={orgUser}
      params={params}
    />
  );

  return (
    <>
      <SubstitutePreferences
        favoriteHeading={t("Favorite Substitutes")}
        blockedHeading={t("Blocked Substitutes")}
        searchHeading={"All Substitutes"}
        favoriteMembers={
          employee?.substitutePreferences?.favoriteSubstituteMembers ?? []
        }
        blockedMembers={
          employee?.substitutePreferences?.blockedSubstituteMembers ?? []
        }
        onAddNote={onAddNote}
        headerComponent={headerComponent}
        orgId={params.organizationId}
        onRemoveFavoriteEmployee={onRemoveFavoriteSubstitute}
        onRemoveBlockedEmployee={onRemoveBlockedSubstitute}
        onAddFavoriteEmployee={onAddSubstitute}
        onBlockEmployee={onBlockSubstitute}
        removeBlockedPermission={[PermissionEnum.EmployeeSaveBlockedSubs]}
        removeFavoritePermission={[PermissionEnum.EmployeeSaveFavoriteSubs]}
        addToBlockedPermission={[PermissionEnum.EmployeeSaveBlockedSubs]}
        addToFavoritePermission={[PermissionEnum.EmployeeSaveFavoriteSubs]}
      />
    </>
  );
};
