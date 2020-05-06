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
import { UpdateSubstitute } from "./graphql/update-substitute.gen";
import { CustomEndorsement } from "ui/components/manage-districts/helpers";
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

  const [substituteInput, setSubstituteInput] = React.useState<
    SubstituteInput
  >();

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

  const getSubRelatedOrgs = useQueryBundle(GetSubstituteRelatedOrgs, {
    variables: {
      id: params.orgUserId,
    },
  });

  const orgUser =
    getSubRelatedOrgs.state === "LOADING"
      ? undefined
      : getSubRelatedOrgs?.data?.orgUser?.byId;

  const orgUserRelationships = orgUser?.orgUserRelationships;

  useEffect(() => {
    const relatedOrgs: SubstituteRelatedOrgInput[] =
      orgUserRelationships?.map(o => ({
        orgId: o?.otherOrganization.orgId ?? "",
        attributes:
          o?.attributes?.map(
            x =>
              ({
                attribute: { id: x?.endorsementId ?? "" },
                expires: x?.expirationDate ?? undefined,
              } as SubstituteAttributeInput)
          ) ?? ([] as SubstituteAttributeInput[]),
      })) ?? [];

    const subInput: SubstituteInput = {
      relatedOrgs: relatedOrgs,
      orgId: params.organizationId,
      id: params.orgUserId,
    };

    setSubstituteInput(subInput);
  }, [orgUserRelationships]);

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

  //console.log(formattedDistrictAttributes);

  const handleUpdateSubstitute = async (substitute: SubstituteInput) => {
    await updateSubstitute({
      variables: {
        substitute: substitute,
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

  const handleAddEndorsement = async (
    endorsementId: string,
    orgId?: string
  ) => {
    const value: SubstituteAttributeInput = {
      attribute: { id: endorsementId },
      expires: undefined,
    };

    substituteInput?.relatedOrgs?.find(
      o => o?.orgId === orgId && o?.attributes?.push(value)
    );

    if (substituteInput) await handleUpdateSubstitute(substituteInput);
  };

  const handleRemoveAttribute = async (endorsement: CustomEndorsement) => {
    const index = endorsement.index ?? -1;

    if (index === -1) return;

    substituteInput?.relatedOrgs?.map(
      o => o?.orgId === endorsement.orgId && o?.attributes?.splice(index, 1)
    );
    if (substituteInput) await handleUpdateSubstitute(substituteInput);
  };

  const handleOnChangeAttribute = async (endorsement: CustomEndorsement) => {
    //Manipulate SubstituteInput Object

    console.log("3");
    //Call to handleUpdateSubstitute on change
    // if (substituteInput) handleUpdateSubstitute(substituteInput);
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
