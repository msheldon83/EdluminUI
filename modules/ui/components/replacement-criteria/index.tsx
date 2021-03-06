import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useIsMobile } from "hooks";
import { useTranslation } from "react-i18next";
import { ReplacementCriteriaView } from "./components/replacement-criteria-view";
import { Qualified } from "./components/qualified";
import { useQueryBundle } from "graphql/hooks";
import { AvailableAttributes } from "./components/available-attributes";

type Props = {
  mustHave: Attribute[];
  preferToHave: Attribute[];
  preferToNotHave: Attribute[];
  mustNotHave: Attribute[];
  availableAttributes?: Attribute[];
  orgId: string;
  handleMust: (ids: string[]) => Promise<boolean>;
  handleMustNot: (ids: string[]) => Promise<boolean>;
  handlePrefer: (ids: string[]) => Promise<boolean>;
  handlePreferNot: (ids: string[]) => Promise<boolean>;
  existingMust: { id: string; name: string }[];
  existingMustNot: { id: string; name: string }[];
  existingPrefer: { id: string; name: string }[];
  existingPreferNot: { id: string; name: string }[];
  endorsementsIgnored: { id: string; name: string }[];
  numMinimallyQualified?: number | undefined;
  numFullyQualified?: number | undefined;
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

  return (
    <>
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
              highlyQualified={props.numFullyQualified}
              minimallyQualified={props.numMinimallyQualified}
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
            label={t("Prefer that substitutes not have")}
            remove={props.handlePreferNot}
          />
          <ReplacementCriteriaView
            attributes={props.mustNotHave}
            label={t("Substitutes must not have")}
            remove={props.handleMustNot}
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
              existingMust={props.existingMust}
              existingMustNot={props.existingMustNot}
              existingPrefer={props.existingPrefer}
              existingPreferNot={props.existingPreferNot}
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
    marginRight: theme.spacing(3),
  },
}));
