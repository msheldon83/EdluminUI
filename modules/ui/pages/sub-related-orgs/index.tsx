import * as React from "react";
import { Typography, makeStyles } from "@material-ui/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SubstituteInput } from "graphql/server-types.gen";
import { ManageDistrictsUI } from "./ui";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetSubstituteRelatedOrgs } from "./graphql/get-sub-related-orgs.gen";
import { AddRelatedOrg } from "./graphql/add-related-org.gen";
import { RemoveRelatedOrg } from "./graphql/remove-related-org.gen";
import { format } from "date-fns";
import { compact } from "lodash-es";
import { UpdateSubstitute } from "./graphql/update-substitute.gen";
import { CustomOrgUserRelationship } from "./helpers";
import { useEndorsements } from "reference-data/endorsements";
import { PersonViewRoute } from "ui/routes/people";
import { Link } from "react-router-dom";
import { useRouteParams } from "ui/routes/definition";
import { OptionType } from "ui/components/form/select";
import { useSnackbar } from "hooks/use-snackbar";
import { parseISO } from "date-fns";
import { ShowErrors } from "ui/components/error-helpers";

export const SubRelatedOrgsEditPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(PersonViewRoute);
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

  const relationships: CustomOrgUserRelationship[] = useMemo(
    () =>
      orgUserRelationships.map(
        o =>
          ({
            otherOrganization: o.otherOrganization,
            attributes:
              compact(o?.attributes).map(x => ({
                endorsementId: x.endorsementId,
                name: x.endorsement.name,
                expirationDate: x.expirationDate
                  ? parseISO(x.expirationDate)
                  : null,
              })) ?? [],
          } ?? [])
      ),
    [orgUserRelationships]
  );

  if (getSubRelatedOrgs.state === "LOADING" || !orgUser?.substitute) {
    return <></>;
  }

  const allDistrictAttributes = orgUser.employee?.endorsements ?? [];
  const formattedDistrictAttributes: string[] =
    allDistrictAttributes.map(
      o =>
        `${
          o?.endorsement.validUntil < new Date("6/6/2079")
            ? `${o?.endorsement.name} (${t("Expires")} ${format(
                parseISO(o?.endorsement.validUntil),
                "MMM, d, yyyy"
              )})`
            : o?.endorsement.name
            ? o.endorsement.name
            : t("Substitute has no Attributes")
        }`
    ) ?? [];

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

  return (
    <>
      <div className={classes.container}>
        <Typography className={classes.header} variant="h4">
          {`${orgUser?.firstName} ${orgUser?.lastName}`}
        </Typography>

        <div className={classes.linkPadding}>
          <Link to={PersonViewRoute.generate(params)} className={classes.link}>
            {t("Return to substitute")}
          </Link>
        </div>

        <Typography variant="h1">{t("Districts")}</Typography>
      </div>
      <ManageDistrictsUI
        onAddOrg={handleAddOrg}
        onRemoveOrg={handleRemoveOrg}
        onSave={handleUpdateSubstitute}
        orgUserRelationships={relationships}
        orgEndorsements={orgEndorsements}
        orgId={params.organizationId}
        allDistrictAttributes={formattedDistrictAttributes}
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
  link: {
    color: theme.customColors.blue,
    "&:visited": {
      color: theme.customColors.blue,
    },
  },
  linkPadding: {
    paddingBottom: theme.typography.pxToRem(15),
  },
}));
