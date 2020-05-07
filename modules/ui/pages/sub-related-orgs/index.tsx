import * as React from "react";
import { useEffect } from "react";
import { Typography, makeStyles } from "@material-ui/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  SubstituteInput,
  SubstituteAttributeInput,
  SubstituteRelatedOrgInput,
} from "graphql/server-types.gen";
import { ManageDistrictsUI } from "../../components/manage-districts/ui";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetSubstituteRelatedOrgs } from "./graphql/get-sub-related-orgs.gen";
import { AddRelatedOrg } from "./graphql/add-related-org.gen";
import { RemoveRelatedOrg } from "./graphql/remove-related-org.gen";
import { compact } from "lodash-es";
import { UpdateSubstitute } from "./graphql/update-substitute.gen";
import { CustomOrgUserRelationship } from "ui/components/manage-districts/helpers";
import { useEndorsements } from "reference-data/endorsements";
import { PeopleSubRelatedOrgsEditRoute } from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { OptionType } from "ui/components/form/select-new";
import { useSnackbar } from "hooks/use-snackbar";
import { parseISO } from "date-fns";
import { ShowErrors } from "ui/components/error-helpers";

export const SubRelatedOrgsEditPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(PeopleSubRelatedOrgsEditRoute);
  const classes = useStyles();

  const getSubRelatedOrgs = useQueryBundle(GetSubstituteRelatedOrgs, {
    variables: {
      id: params.orgUserId,
    },
  });

  const [addRelatedOrg] = useMutationBundle(AddRelatedOrg, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [removeRelatedOrg] = useMutationBundle(RemoveRelatedOrg, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [updateSubstitute] = useMutationBundle(UpdateSubstitute, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const orgEndorsementsQueryed = useEndorsements(params.organizationId);
  const orgEndorsements: OptionType[] = useMemo(
    () =>
      orgEndorsementsQueryed.map(p => ({
        label: p?.name ?? "",
        value: p?.id ?? "",
      })),
    [orgEndorsementsQueryed]
  );

  const orgUser =
    getSubRelatedOrgs.state === "LOADING"
      ? undefined
      : getSubRelatedOrgs?.data?.orgUser?.byId;

  const orgUserRelationships = compact(orgUser?.orgUserRelationships) ?? [];

  if (getSubRelatedOrgs.state === "LOADING" || !orgUser?.substitute) {
    return <></>;
  }

  //TODO: Create string in format "Attribute (Expires April 23, 2019)"
  const allDistrictAttributes = orgUser.employee?.endorsements ?? [];
  const formattedDistrictAttributes =
    allDistrictAttributes.length > 0
      ? allDistrictAttributes
          .filter(x => !x?.endorsement.expires)
          .map(
            o =>
              o?.endorsement.name +
              `${t("(Expires ")} ${o?.endorsement.validUntil} ${t(")")}`
          )
          .toString()
      : [];

  const handleUpdateSubstitute = async (substitute: SubstituteInput) => {
    await updateSubstitute({
      variables: {
        substitute: {
          ...substitute,
          orgId: params.organizationId,
          id: params.orgUserId,
        },
      },
    });
  };

  const handleAddOrg = async (orgId: string) => {
    await addRelatedOrg({
      variables: {
        orgUserId: params.orgUserId,
        relatedOrgId: orgId,
      },
    });
    await getSubRelatedOrgs.refetch();
  };

  const handleRemoveOrg = async (orgId: string) => {
    await removeRelatedOrg({
      variables: {
        orgUserId: params.orgUserId,
        relatedOrgId: orgId,
      },
    });
    await getSubRelatedOrgs.refetch();
  };

  const relationships: CustomOrgUserRelationship[] =
    orgUserRelationships.map(o => ({
      otherOrganization: o.otherOrganization,
      attributes:
        compact(o?.attributes).map(x => ({
          endorsementId: x.endorsementId,
          name: x.endorsement.name,
          expirationDate: x.expirationDate ? parseISO(x.expirationDate) : null,
        })) ?? [],
    })) ?? [];

  return (
    <>
      <div className={classes.container}>
        <Typography className={classes.header} variant="h4">
          {`${orgUser?.firstName} ${orgUser?.lastName}`}
        </Typography>
        <Typography variant="h1">{t("Districts")}</Typography>
      </div>
      <ManageDistrictsUI
        onAddOrg={handleAddOrg}
        onRemoveOrg={handleRemoveOrg}
        onSave={handleUpdateSubstitute}
        orgUserRelationships={relationships}
        orgEndorsements={orgEndorsements}
        orgId={params.organizationId}
        allDistrictAttributes={formattedDistrictAttributes as string[]}
        isAdmin={true}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
    fontSize: theme.typography.pxToRem(24),
    fontWeight: 400,
  },
  container: {
    marginBottom: theme.spacing(2),
  },
}));
