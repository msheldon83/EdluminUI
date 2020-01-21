import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { Grid, makeStyles } from "@material-ui/core";
import { PageHeader } from "ui/components/page-header";
import { useIsMobile } from "hooks";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDeferredState } from "hooks";
import { ReplacementCriteriaView } from "./components/replacement-criteria-view";
import { Qualified } from "./components/qualified";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { AvailableAttributes } from "./components/available-attributes";
import { GetQualifiedEmployeeCountsWithinOrg } from "./graphql/get-qualified-employee-counts.gen";

type Props = {
  mustHave: Attribute[];
  preferToHave: Attribute[];
  preferToNotHave: Attribute[];
  mustNotHave: Attribute[];
  availableAttributes?: Attribute[];
  positionName: string | undefined;
  orgId: string;
  positionId: string | undefined;
  handleMust: (ids: string[]) => Promise<void>;
  handleMustNot: (ids: string[]) => Promise<void>;
  handlePrefer: (ids: string[]) => Promise<void>;
  handlePreferNot: (ids: string[]) => Promise<void>;
  endorsementsIgnored: { name: string; id: string }[];
};

export type Attribute = {
  name: string;
  id: string;
  remove?: () => void;
  inherited?: boolean;
};

export const ReplacementCriteriaUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const classes = useStyles();

  //Query qualified numbers
  const getQualifiedNumbers = useQueryBundle(
    GetQualifiedEmployeeCountsWithinOrg,
    {
      variables: {
        orgId: props.orgId,
        positionId: Number(props.positionId),
      },
    }
  );

  if (getQualifiedNumbers.state === "LOADING") {
    return <></>;
  }

  const qualifiedCounts =
    getQualifiedNumbers?.data?.position?.qualifiedEmployeeCounts;

  return (
    <>
      <PageTitle title={t("Replacement Criteria")} withoutHeading={!isMobile} />
      <PageHeader
        text={t("Replacement Criteria - " + props.positionName)}
        label={t("Name")}
      />
      <Grid container className={classes.topPadding}>
        <Grid
          container
          item
          xs={6}
          spacing={2}
          className={classes.rightPadding}
        >
          <Grid item xs={12}>
            <Qualified
              highlyQualified={qualifiedCounts?.numFullyQualified}
              minimallyQualified={qualifiedCounts?.numMinimallyQualified}
            />
          </Grid>
          <ReplacementCriteriaView
            attributes={props.mustHave}
            label={t("Substitutes must have")}
            remove={props.handleMust}
          />
          <ReplacementCriteriaView
            attributes={props.preferToHave}
            label={t("Prefer that substitutes have")}
            remove={props.handlePrefer}
          />
          <ReplacementCriteriaView
            attributes={props.preferToNotHave}
            label={t("Substitutes must not have")}
            remove={props.handleMustNot}
          />
          <ReplacementCriteriaView
            attributes={props.mustNotHave}
            label={t("Prefer that substitutes not have")}
            remove={props.handlePreferNot}
          />
        </Grid>
        <Grid container item xs={6} component="dl" spacing={2}>
          <Grid item xs={12}>
            <AvailableAttributes
              orgId={props.orgId}
              handleMust={props.handleMust}
              handleMustNot={props.handleMustNot}
              handlePrefer={props.handlePrefer}
              handlePreferNot={props.handlePreferNot}
              endorsementsIgnored={props.endorsementsIgnored}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  topPadding: {
    paddingTop: theme.spacing(4),
  },
  rightPadding: {
    paddingRight: theme.spacing(3),
  },
}));
