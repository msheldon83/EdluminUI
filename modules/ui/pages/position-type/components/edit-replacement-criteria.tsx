import * as React from "react";
import { Redirect } from "react-router";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { GetPositionTypeById } from "ui/pages/position-type/graphql/position-type.gen";
import { UpdatePositionType } from "ui/pages/position-type/graphql/update-position-type.gen";
import { GetQualifiedPositionTypeCountsWithinOrg } from "ui/components/replacement-criteria/graphql/get-qualified-position-type-counts.gen";
import { useCallback } from "react";
import { useSnackbar } from "hooks/use-snackbar";
import { PositionType } from "graphql/server-types.gen";
import { ShowErrors } from "ui/components/error-helpers";
import { ReplacementCriteriaUI } from "ui/components/replacement-criteria/index";
import { useRouteParams } from "ui/routes/definition";
import {
  PositionTypeViewRoute,
  PositionTypeRoute,
} from "ui/routes/position-type";

type Props = {};

export const PeopleReplacementCriteriaEdit: React.FC<Props> = props => {
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(PositionTypeViewRoute);

  const [updatePositionType] = useMutationBundle(UpdatePositionType, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    refetchQueries: ["GetQualifiedPositionTypeCountsWithinOrg"],
  });

  const getPositionType = useQueryBundle(GetPositionTypeById, {
    variables: { id: params.positionTypeId },
  });

  const positionType = (getPositionType.state === "LOADING" ||
  getPositionType.state === "UPDATING"
    ? undefined
    : getPositionType.data?.positionType?.byId) as Pick<
    PositionType,
    "id" | "orgId" | "name" | "rowVersion" | "replacementCriteria"
  >;

  //Query qualified numbers
  const getQualifiedNumbers = useQueryBundle(
    GetQualifiedPositionTypeCountsWithinOrg,
    {
      variables: {
        orgId: params.organizationId,
        positionTypeId: Number(params.positionTypeId),
      },
    }
  );

  //Mutations
  const updateMustHave = useCallback(
    async (mustHaveInput: string[]) => {
      const result = await updatePositionType({
        variables: {
          positionType: {
            id: Number(params.positionTypeId),
            rowVersion: positionType?.rowVersion,
            replacementCriteria: {
              mustHave: mustHaveInput.map(l => ({ id: l })),
            },
          },
        },
      });
      if (result) {
        await getPositionType.refetch();
        return true;
      }
      return false;
    },
    [updatePositionType, getPositionType, positionType, params.positionTypeId]
  );

  const updateMustNot = useCallback(
    async (mustNotInput: string[]) => {
      const result = await updatePositionType({
        variables: {
          positionType: {
            id: Number(params.positionTypeId),
            rowVersion: positionType?.rowVersion,
            replacementCriteria: {
              mustNotHave: mustNotInput.map(l => ({ id: l })),
            },
          },
        },
      });
      if (result) {
        await getPositionType.refetch();
        return true;
      }
      return false;
    },
    [updatePositionType, getPositionType, positionType, params.positionTypeId]
  );

  const updatePreferHave = useCallback(
    async (shouldHaveInput: string[]) => {
      const result = await updatePositionType({
        variables: {
          positionType: {
            id: Number(params.positionTypeId),
            rowVersion: positionType?.rowVersion,
            replacementCriteria: {
              shouldHave: shouldHaveInput.map(l => ({ id: l })),
            },
          },
        },
      });
      if (result) {
        await getPositionType.refetch();
        return true;
      }
      return false;
    },
    [updatePositionType, getPositionType, positionType, params.positionTypeId]
  );

  const updatePreferNotHave = useCallback(
    async (shouldNotHaveInput: string[]) => {
      const result = await updatePositionType({
        variables: {
          positionType: {
            id: Number(params.positionTypeId),
            rowVersion: positionType?.rowVersion,
            replacementCriteria: {
              shouldNotHave: shouldNotHaveInput.map(l => ({ id: l })),
            },
          },
        },
      });
      if (result) {
        await getPositionType.refetch();
        return true;
      }
      return false;
    },
    [updatePositionType, getPositionType, positionType, params.positionTypeId]
  );

  if (getPositionType.state === "LOADING") {
    return <></>;
  }

  const qualifiedCounts =
    getQualifiedNumbers.state === "LOADING" ||
    getQualifiedNumbers.state === "UPDATING"
      ? undefined
      : getQualifiedNumbers?.data?.positionType?.qualifiedEmployeeCounts;

  if (getPositionType.state === "DONE" && !positionType) {
    const listUrl = PositionTypeRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  //Get Replacement Criteria
  const replacementCriteria = positionType?.replacementCriteria;
  const mustHave =
    replacementCriteria?.mustHave?.map(e => ({
      name: e?.name ?? "",
      id: e?.id ?? "",
    })) ?? [];
  const preferToHave =
    replacementCriteria?.preferToHave?.map(e => ({
      name: e?.name ?? "",
      id: e?.id ?? "",
    })) ?? [];
  const preferNotToHave =
    replacementCriteria?.preferToNotHave?.map(e => ({
      name: e?.name ?? "",
      id: e?.id ?? "",
    })) ?? [];
  const mustNotHave =
    replacementCriteria?.mustNotHave?.map(e => ({
      name: e?.name ?? "",
      id: e?.id ?? "",
    })) ?? [];

  //Endorsements to Ignore
  const endorsementsIgnored = mustHave.concat(
    preferToHave,
    preferNotToHave,
    mustNotHave
  );

  return (
    <>
      <ReplacementCriteriaUI
        mustHave={mustHave}
        preferToHave={preferToHave}
        preferToNotHave={preferNotToHave}
        mustNotHave={mustNotHave}
        title={positionType?.name}
        orgId={params.organizationId}
        handleMust={updateMustHave}
        handleMustNot={updateMustNot}
        handlePrefer={updatePreferHave}
        handlePreferNot={updatePreferNotHave}
        existingMust={mustHave}
        existingMustNot={mustNotHave}
        existingPrefer={preferToHave}
        existingPreferNot={preferNotToHave}
        endorsementsIgnored={endorsementsIgnored}
        numMinimallyQualified={qualifiedCounts?.numMinimallyQualified}
        numFullyQualified={qualifiedCounts?.numFullyQualified}
      />
    </>
  );
};