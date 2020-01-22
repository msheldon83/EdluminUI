import { makeStyles } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { Typography, Grid, Link } from "@material-ui/core";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { PersonViewRoute } from "ui/routes/people";
import { PageTitle } from "ui/components/page-title";
import { GetSubstituteById } from "../people/graphql/substitute/get-substitute-by-id.gen";
import {
  SubPositionTypesAndAttributesEdit,
  Attributes,
} from "./components/position-types-attributes";
import { useMemo, useCallback } from "react";
import { ShowErrors } from "ui/components/error-helpers";
import { AddEmployeeEndorsement } from "ui/components/employee/graphql/add-endorsement.gen";
import { RemoveEmployeeEndorsement } from "ui/components/employee/graphql/remove-endorsement.gen";
import { UpdateEmployeeEndorsement } from "ui/components/employee/graphql/update-endorsement.gen";
import { useSnackbar } from "hooks/use-snackbar";

type Props = {};

export const SubPositionsAttributes: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(PersonViewRoute);
  const { openSnackbar } = useSnackbar();

  // Get the Substitute info
  const getSubstituteById = useQueryBundle(GetSubstituteById, {
    variables: { id: params.orgUserId },
  });

  const substitute =
    getSubstituteById.state === "LOADING"
      ? undefined
      : getSubstituteById?.data?.orgUser?.byId?.substitute;

  const currentAttributes: Attributes[] = useMemo(() => {
    if (!substitute?.attributes) {
      return [];
    }

    return substitute.attributes.map(a => {
      return {
        endorsementId: a.endorsement.id,
        name: a.endorsement.name,
        expirationDate: a.expirationDate,
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
    async (endorsementId: string) => {
      const response = await addEmployeeEndorsement({
        variables: {
          employeeEndorsementInput: {
            orgId: Number(params.organizationId),
            employeeId: Number(params.orgUserId),
            endorsementId: Number(endorsementId),
          },
        },
      });
      return !!response?.data;
    },
    [addEmployeeEndorsement]
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
            orgId: Number(params.organizationId),
            employeeId: Number(params.orgUserId),
            endorsementId: Number(endorsementId),
            expirationDate,
          },
        },
      });
      return !!response?.data;
    },
    [updateEmployeeEndorsement]
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
          employeeId: Number(params.orgUserId),
          endorsementId: Number(endorsementId),
        },
      });
      return !!response?.data;
    },
    [removeEmployeeEndorsement]
  );

  if (getSubstituteById.state === "LOADING") {
    return <></>;
  }

  const fullName = substitute?.firstName + " " + substitute?.lastName;

  return (
    <>
      <Typography variant="h5">{fullName}</Typography>
      <PageTitle title={t("Position types & Attributes")} />
      <SubPositionTypesAndAttributesEdit
        organizationId={params.organizationId}
        orgUserId={params.orgUserId}
        qualifiedPositionTypes={substitute?.qualifiedPositionTypes ?? []}
        currentAttributes={currentAttributes}
        addAttribute={addAttribute}
        updateAttribute={updateAttribute}
        removeAttribute={removeAttribute}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({}));
