import { makeStyles } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { Typography } from "@material-ui/core";
import { useRouteParams } from "ui/routes/definition";
import { PersonViewRoute } from "ui/routes/people";
import { GetSubstituteById } from "../people/graphql/substitute/get-substitute-by-id.gen";
import { SubPositionTypesAndAttributesEdit } from "./components/position-types-attributes";
import { Attribute } from "./types";
import { useMemo, useCallback } from "react";
import { ShowErrors } from "ui/components/error-helpers";
import { AddEmployeeEndorsement } from "ui/components/employee/graphql/add-endorsement.gen";
import { RemoveEmployeeEndorsement } from "ui/components/employee/graphql/remove-endorsement.gen";
import { UpdateEmployeeEndorsement } from "ui/components/employee/graphql/update-endorsement.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { parseISO } from "date-fns";
import { PersonLinkHeader } from "ui/components/link-headers/person";

type Props = {};

export const SubPositionsAttributes: React.FC<Props> = props => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const params = useRouteParams(PersonViewRoute);
  const { openSnackbar } = useSnackbar();

  // Get the Substitute info
  const getSubstituteById = useQueryBundle(GetSubstituteById, {
    variables: { id: params.orgUserId },
  });

  const orgUser =
    getSubstituteById.state === "LOADING"
      ? undefined
      : getSubstituteById?.data?.orgUser?.byId;
  const substitute = orgUser?.substitute;

  const currentAttributes: Attribute[] = useMemo(() => {
    if (!substitute?.attributes) {
      return [];
    }

    return substitute.attributes.map(a => {
      return {
        endorsementId: a.endorsement.id,
        name: a.endorsement.name,
        expirationDate: a.expirationDate ? parseISO(a.expirationDate) : null,
        expires: a.endorsement.expires,
      };
    });
  }, [substitute]);

  // Define mutations and functions
  const [addEmployeeEndorsement] = useMutationBundle(AddEmployeeEndorsement, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const addAttribute = useCallback(
    async (attribute: Attribute) => {
      const response = await addEmployeeEndorsement({
        variables: {
          employeeEndorsementInput: {
            orgId: params.organizationId,
            employeeId: params.orgUserId,
            endorsementId: attribute.endorsementId,
          },
        },
      });
      return !!response?.data;
    },
    [addEmployeeEndorsement, params.organizationId, params.orgUserId]
  );

  const [updateEmployeeEndorsement] = useMutationBundle(
    UpdateEmployeeEndorsement,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const updateAttribute = useCallback(
    async (endorsementId: string, expirationDate?: Date | undefined) => {
      const response = await updateEmployeeEndorsement({
        variables: {
          employeeEndorsementInput: {
            orgId: params.organizationId,
            employeeId: params.orgUserId,
            endorsementId,
            expirationDate,
          },
        },
      });
      return !!response?.data;
    },
    [updateEmployeeEndorsement, params.organizationId, params.orgUserId]
  );

  const [removeEmployeeEndorsement] = useMutationBundle(
    RemoveEmployeeEndorsement,
    {
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const removeAttribute = useCallback(
    async (endorsementId: string) => {
      const response = await removeEmployeeEndorsement({
        variables: {
          employeeId: params.orgUserId,
          endorsementId,
        },
      });
      return !!response?.data;
    },
    [removeEmployeeEndorsement, params.orgUserId]
  );

  if (getSubstituteById.state === "LOADING") {
    return <></>;
  }

  return (
    <>
      <PersonLinkHeader
        title={t("Position types & Attributes")}
        person={orgUser ?? undefined}
        params={params}
      />
      <SubPositionTypesAndAttributesEdit
        organizationId={params.organizationId}
        orgUserId={params.orgUserId}
        currentAttributes={currentAttributes}
        addAttribute={addAttribute}
        updateAttribute={updateAttribute}
        removeAttribute={removeAttribute}
      />
    </>
  );
};
