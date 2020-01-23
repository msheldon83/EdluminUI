import * as React from "react";
import { Redirect } from "react-router";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { GetPositionTypeById } from "ui/pages/position-type/graphql/position-type.gen";
import { UpdatePositionType } from "ui/pages/position-type/graphql/update-position-type.gen";
import { GetQualifiedPositionTypeCountsWithinOrg } from "ui/components/replacement-criteria/graphql/get-qualified-position-type-counts.gen";
import { useCallback } from "react";
import { useSnackbar } from "hooks/use-snackbar";
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
  });

  const getPositionType = useQueryBundle(GetPositionTypeById, {
    variables: { id: params.positionTypeId },
  });

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
            id: params.positionTypeId,
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
    [updatePositionType]
  );

  const updateMustNot = useCallback(
    async (mustNotInput: string[]) => {
      const result = await updatePositionType({
        variables: {
          positionType: {
            id: params.positionTypeId,
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
    [updatePositionType]
  );

  const updatePreferHave = useCallback(
    async (shouldHaveInput: string[]) => {
      const result = await updatePositionType({
        variables: {
          positionType: {
            id: params.positionTypeId,
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
    [updatePositionType]
  );

  const updatePreferNotHave = useCallback(
    async (shouldNotHaveInput: string[]) => {
      const result = await updatePositionType({
        variables: {
          positionType: {
            id: params.positionTypeId,
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
    [updatePositionType]
  );

  if (
    getPositionType.state === "LOADING" ||
    getQualifiedNumbers.state === "LOADING"
  ) {
    return <></>;
  }

  const positionType = getPositionType?.data?.positionType?.byId;

  const qualifiedCounts =
    getQualifiedNumbers?.data?.positionType?.qualifiedEmployeeCounts;

  if (!positionType) {
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
