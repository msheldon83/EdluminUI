import * as React from "react";
import { Divider, Grid, makeStyles } from "@material-ui/core";
import { useMemo } from "react";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { Organization, Maybe } from "graphql/server-types.gen";
import clsx from "clsx";
import { OptionType } from "ui/components/form/select-new";
import { useQueryBundle } from "graphql/hooks";
import { AutoCompleteSearch } from "ui/components/autocomplete-search";

type Props = {
  relatedOrgs: Maybe<Pick<Organization, "id" | "name" | "orgId">>[];
  onRemoveOrg: (orgId: string) => Promise<unknown>;
  onAddAttribute: (attributeId: string) => Promise<unknown>;
  onRemoveAttribute: (orgId: string) => Promise<unknown>;
};

export const SelectedDistrict: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState<string | undefined>();

  const { relatedOrgs, onRemoveOrg, onRemoveAttribute, onAddAttribute } = props;

  return (
    <Section>
      <SectionHeader title={t("Selected districts")} />
      <Grid item xs={4} container className={classes.inline}>
        {t("Name")}
      </Grid>
      <Grid item xs={4} container className={classes.inline}>
        {t("District specific attributes")}
      </Grid>
      <Grid item xs={4} container className={classes.inline}></Grid>
      <Divider />
      {relatedOrgs.length === 0 ? (
        <div>{t("No selected districts")}</div>
      ) : (
        relatedOrgs?.map((n, i) => (
          <div key={i}>
            <Grid item xs={12}>
              <Grid item xs={4} container className={classes.inline}>
                {n?.name}
              </Grid>
              <Grid item xs={4} container className={classes.inline}>
                <AutoCompleteSearch
                  searchText={searchText}
                  onClick={onAddAttribute}
                  options={}
                  setSearchText={setSearchText}
                  placeholder={t("search")}
                  useLabel={false}
                />
                {/* For Reach on all attributes */}
              </Grid>
              <Grid item xs={4} container className={classes.inline}>
                <TextButton
                  className={classes.floatRight}
                  onClick={() => onRemoveOrg(n?.id ?? "")}
                >
                  {t("Remove")}
                </TextButton>
              </Grid>
            </Grid>
          </div>
        ))
      )}
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: 0,
  },
  cancel: { color: theme.customColors.darkRed },
  inline: {
    display: "inline-block",
  },
  floatRight: {
    float: "right",
  },
}));
