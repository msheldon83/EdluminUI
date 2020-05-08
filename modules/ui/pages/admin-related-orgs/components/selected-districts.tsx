import * as React from "react";
import { Divider, Grid, makeStyles } from "@material-ui/core";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { OptionType } from "ui/components/form/select-new";
import { useState } from "react";
import { Section } from "ui/components/section";
import clsx from "clsx";
import { SectionHeader } from "ui/components/section-header";

type Props = {
  orgUserRelationships: CustomOrgUserRelationship[];
  onRemoveOrg: (orgId: string) => Promise<unknown>;
};

export const SelectedDistricts: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { orgUserRelationships, onRemoveOrg } = props;

  return (
    <Section>
      <SectionHeader title={t("Selected districts")} />
      <Grid item xs={6} container className={classes.inline}>
        <div className={classes.paddingLeft}>{t("Name")}</div>
      </Grid>
      <Grid item xs={6} container className={classes.inline}></Grid>
      <Divider />
      {orgUserRelationships?.length === 0 ? (
        <div className={classes.containerPadding}>
          {t("No selected districts")}
        </div>
      ) : (
        orgUserRelationships.map((n, i) => {
          if (n) {
            return (
              <div key={i}>
                <Grid
                  item
                  xs={12}
                  className={clsx({
                    [classes.background]: i % 2,
                    [classes.containerPadding]: true,
                  })}
                >
                  <Grid
                    item
                    xs={6}
                    container
                    className={clsx({
                      [classes.inline]: true,
                      [classes.verticalAlignTop]: true,
                    })}
                  >
                    <div className={classes.paddingLeft}>
                      {n?.otherOrganization?.name}
                    </div>
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    container
                    className={clsx({
                      [classes.inline]: true,
                      [classes.verticalAlignTop]: true,
                    })}
                  >
                    <TextButton
                      className={clsx({
                        [classes.paddingRight]: true,
                        [classes.floatRight]: true,
                        [classes.linkText]: true,
                      })}
                      onClick={() =>
                        onRemoveOrg(n.otherOrganization?.orgId ?? "")
                      }
                    >
                      {t("Remove")}
                    </TextButton>
                  </Grid>
                </Grid>
              </div>
            );
          }
        })
      )}
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  inline: {
    display: "inline-block",
  },
  floatRight: {
    float: "right",
  },
  verticalAlignTop: {
    verticalAlign: "top",
    paddingTop: theme.spacing(2),
  },
  paddingRight: {
    paddingRight: theme.spacing(2),
  },
  paddingLeft: {
    paddingLeft: theme.spacing(2),
  },
  linkText: {
    color: theme.customColors.primary,
  },
  background: {
    backgroundColor: theme.customColors.lightGray,
  },
  containerPadding: {
    paddingBottom: theme.spacing(1),
  },
}));
