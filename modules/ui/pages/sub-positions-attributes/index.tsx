import { makeStyles } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { Typography, Grid, Link } from "@material-ui/core";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { PersonViewRoute } from "ui/routes/people";
import { PageTitle } from "ui/components/page-title";
import { useEndorsements } from "reference-data/endorsements";
import { GetAllPositionTypesWithReplacementCriteria } from "./graphql/get-all-position-types.gen";
import { compact } from "lodash-es";
import { useMemo, useState } from "react";
import { GetSubstituteById } from "../people/graphql/substitute/get-substitute-by-id.gen";
import { Section } from "ui/components/section";

type Props = {};

export const SubPositionsAttributes: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(PersonViewRoute);
  const orgId = params.organizationId;
  const orgUserId = params.orgUserId;
  const [endorsementSearchText, setEndorsementSearchText] = useState<
    string | undefined
  >(undefined);
  const allEndorsements = useEndorsements(orgId, false, endorsementSearchText);

  // Get all of the Position Types in the Org
  const positionTypeResponse = useQueryBundle(
    GetAllPositionTypesWithReplacementCriteria,
    {
      fetchPolicy: "cache-first",
      variables: { orgId },
    }
  );
  const allPositionTypes = useMemo(() => {
    if (
      positionTypeResponse.state === "DONE" &&
      positionTypeResponse.data.positionType
    ) {
      return compact(positionTypeResponse.data.positionType.all) ?? [];
    }
    return [];
  }, [positionTypeResponse]);

  // Get the Substitute info
  const getSubstituteById = useQueryBundle(GetSubstituteById, {
    variables: { id: orgUserId },
  });

  const substitute =
    getSubstituteById.state === "LOADING"
      ? undefined
      : getSubstituteById?.data?.orgUser?.byId?.substitute;

  // Determine which Position Types the Sub isn't currently qualified for
  const qualifiedPositionTypes = useMemo(
    () => substitute?.qualifiedPositionTypes ?? [],
    [substitute]
  );
  const unqualifiedPositionTypes = useMemo(() => {
    return allPositionTypes.filter(
      p => !qualifiedPositionTypes.find(q => q?.id === p.id)
    );
  }, [qualifiedPositionTypes, allPositionTypes]);

  // Determine which Endorsements the Sub doesn't already have
  const currentEndorsements = useMemo(() => substitute?.attributes ?? [], [
    substitute,
  ]);
  const missingEndorsements = useMemo(() => {
    return allEndorsements.filter(
      e => !currentEndorsements.find(c => c?.endorsement?.id === e.id)
    );
  }, [currentEndorsements, allEndorsements]);

  if (getSubstituteById.state === "LOADING") {
    return <></>;
  }

  const fullName = substitute?.firstName + " " + substitute?.lastName;

  return (
    <>
      <Typography variant="h5">{fullName}</Typography>
      <PageTitle title={t("Position types & Attributes")} />
      <Section>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <Typography variant="h5" className={classes.sectionHeader}>
              {t("Qualified for position types")}
            </Typography>
            {qualifiedPositionTypes.map((p, i) => {
              return (
                <div key={i} className={getRowClasses(classes, i)}>
                  {p!.name}
                </div>
              );
            })}
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h5" className={classes.sectionHeader}>
              {t("Not qualified for position types")}
            </Typography>
            {unqualifiedPositionTypes.length === 0 ? (
              <div className={classes.allOrNoneRow}>{t("None")}</div>
            ) : (
              unqualifiedPositionTypes.map((p, i) => {
                return (
                  <div key={i} className={getRowClasses(classes, i)}>
                    {p!.name}
                  </div>
                );
              })
            )}
          </Grid>
        </Grid>
      </Section>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Section className={classes.attributesSection}>
            <Typography variant="h5" className={classes.sectionHeader}>
              {t("Selected attributes")}
            </Typography>
            <Grid container item xs={12}>
              {currentEndorsements.length === 0 ? (
                <div className={classes.allOrNoneRow}>{t("None")}</div>
              ) : (
                <>
                  <Grid item xs={6}>
                    {t("Name")}
                  </Grid>
                  <Grid item xs={6}>
                    {t("Expires")}
                  </Grid>
                  {currentEndorsements.map((p, i) => {
                    return (
                      <div key={i} className={getRowClasses(classes, i)}>
                        <Grid item xs={6}>
                          {p!.endorsement!.name}
                        </Grid>
                        <Grid item xs={6}>
                          {/* TODO: Textbox to edit and save on blur (or call prop function for both create/edit)  */}
                          {p!.expirationDate}
                        </Grid>
                      </div>
                    );
                  })}
                </>
              )}
            </Grid>
          </Section>
        </Grid>
        <Grid item xs={6}>
          <Section className={classes.attributesSection}>
            <Typography variant="h5" className={classes.sectionHeader}>
              {t("Available attributes")}
            </Typography>
            {/* TODO: Add search box for client side search */}
            <Grid container item xs={12}>
              {missingEndorsements.map((p, i) => {
                return (
                  <div
                    key={i}
                    className={`${
                      classes.availableAttributeRow
                    } ${getRowClasses(classes, i)}`}
                  >
                    <div>{p!.name}</div>
                    <div>
                      <Link className={classes.action} onClick={() => {}}>
                        {t("Add")}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </Grid>
          </Section>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  sectionHeader: {
    marginBottom: theme.spacing(2),
  },
  allOrNoneRow: {
    color: theme.customColors.edluminSubText,
  },
  row: {
    width: "100%",
    padding: theme.spacing(),
  },
  firstRow: {
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
  },
  shadedRow: {
    background: theme.customColors.lightGray,
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    borderBottom: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
  },
  availableAttributeRow: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  action: {
    cursor: "pointer",
  },
  attributesSection: {
    height: "100%",
  },
}));

const getRowClasses = (classes: any, index: number): string => {
  const rowClasses = [classes.row];
  if (index === 0) {
    rowClasses.push(classes.firstRow);
  }
  if (index % 2 === 1) {
    rowClasses.push(classes.shadedRow);
  }

  return rowClasses.join(" ");
};
