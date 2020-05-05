import * as React from "react";
import { Typography, makeStyles } from "@material-ui/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SubstituteInput } from "graphql/server-types.gen";
import { ManageDistrictsUI } from "../../components/manage-districts/ui";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetSubstituteRelatedOrgs } from "./graphql/get-sub-related-orgs.gen";
import { AddRelatedOrg } from "./graphql/add-related-org.gen";
import { RemoveRelatedOrg } from "./graphql/remove-related-org.gen";
import { AddOrgUserAttributeToSub } from "./graphql/add-org-user-attribute.gen";
import { useEndorsements } from "reference-data/endorsements";
import { PeopleSubRelatedOrgsEditRoute } from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { OptionType } from "ui/components/form/select-new";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";

export const SubRelatedOrgsEditPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(PeopleSubRelatedOrgsEditRoute);
  const classes = useStyles();

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

  const [addEndorsement] = useMutationBundle(AddOrgUserAttributeToSub, {
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

  const getSubRelatedOrgs = useQueryBundle(GetSubstituteRelatedOrgs, {
    variables: {
      id: params.orgUserId,
    },
  });

  const orgUser =
    getSubRelatedOrgs.state === "LOADING"
      ? undefined
      : getSubRelatedOrgs?.data?.orgUser?.byId;

  if (getSubRelatedOrgs.state === "LOADING" || !orgUser?.substitute) {
    return <></>;
  }

  const orgUserRelationships = orgUser?.orgUserRelationships;

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

  console.log(formattedDistrictAttributes);

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

  const handleAddEndorsement = async (substitute: SubstituteInput) => {
    await addEndorsement({
      variables: {
        substitute: substitute,
      },
    });
    await getSubRelatedOrgs.refetch();
  };

  const handleRemoveAttribute = async (endorsementId: string) => {
    //TODO:
    // await removeRelatedOrg({
    //   variables: {
    //     orgUserId: params.orgUserId,
    //     relatedOrgId: orgId,
    //   },
    // });
    // await getSubRelatedOrgs.refetch();
  };

  const handleOnChangeAttribute = async (
    endorsementId: string,
    expirationDate: Date
  ) => {
    //TODO:
    // await removeRelatedOrg({
    //   variables: {
    //     orgUserId: params.orgUserId,
    //     relatedOrgId: orgId,
    //   },
    // });
    // await getSubRelatedOrgs.refetch();
  };

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
        onAddEndorsement={handleAddEndorsement}
        onChangeEndorsement={handleOnChangeAttribute}
        onRemoveEndorsement={handleRemoveAttribute}
        orgUserRelationships={orgUserRelationships}
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
