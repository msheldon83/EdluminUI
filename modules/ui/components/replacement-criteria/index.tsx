import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { Grid, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { PageHeader } from "ui/components/page-header";
import { useIsMobile } from "hooks";
import { useTranslation } from "react-i18next";
import { ReplacementCriteriaView } from "./components/replacement-criteria-view";
import { Qualified } from "./components/qualified";
import { AvailableAttributes } from "./components/available-attributes";

type Props = {
  mustHave: attribute[];
  preferToHave: attribute[];
  preferToNotHave: attribute[];
  mustNotHave: attribute[];
  availableAttributes: attribute[];
  name: string;
};

type attribute = {
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
      <PageTitle title={t("Replacement Criteria")} withoutHeading={!isMobile} />
      <PageHeader
        text={t("Replacement Criteria - " + props.name)}
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
              highlyQualified={1}
              minimallyQualified={2}
              label={"thnig"}
            />
          </Grid>

          <ReplacementCriteriaView
            data={props?.mustHave}
            label={t("Substitutes must have")}
          />
          <ReplacementCriteriaView
            data={props?.preferToHave}
            label={t("Prefer that substitutes have")}
          />
          <ReplacementCriteriaView
            data={props?.preferToNotHave}
            label={t("Substitutes must not have")}
          />
          <ReplacementCriteriaView
            data={props?.mustNotHave}
            label={t("Prefer that substitutes not have")}
          />
        </Grid>
        <Grid container item xs={6} component="dl" spacing={2}>
          <Grid item xs={12}>
            <AvailableAttributes data={props.availableAttributes} />
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
