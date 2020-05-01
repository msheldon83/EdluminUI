import * as React from "react";
import { Divider, Grid, makeStyles } from "@material-ui/core";
import { useMemo } from "react";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { Maybe, OrgUserRelationship } from "graphql/server-types.gen";
import { AutoCompleteSearch } from "ui/components/autocomplete-search";
import { DistrictDetail } from "./district-detail";

type Props = {
  orgUserRelationships: Maybe<
    Pick<
      OrgUserRelationship,
      "otherOrganization" | "orgUserRelationshipAttributes"
    >
  >[];
  onRemoveOrg: (orgId: string) => Promise<unknown>;
  onAddEndorsement: (endorsementId: string) => Promise<unknown>;
  onRemoveEndorsement: (endorsementId: string) => Promise<unknown>;
  onChangeEndorsement: (
    endorsementId: string,
    expirationDate: Date
  ) => Promise<unknown>;
};

export const SelectedDistrict: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState<string | undefined>();

  const {
    orgUserRelationships,
    onRemoveOrg,
    onChangeEndorsement,
    onRemoveEndorsement,
    onAddEndorsement,
  } = props;

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
      {orgUserRelationships.length === 0 ? (
        <div>{t("No selected districts")}</div>
      ) : (
        orgUserRelationships?.map((n, i) => (
          <div key={i}>
            <Grid item xs={12}>
              <Grid item xs={4} container className={classes.inline}>
                {n?.otherOrganization?.[i]?.name}
              </Grid>
              <Grid item xs={4} container className={classes.inline}>
                <AutoCompleteSearch
                  searchText={searchText}
                  onClick={onAddEndorsement}
                  options={}
                  setSearchText={setSearchText}
                  placeholder={t("search")}
                  useLabel={false}
                />
                {n?.orgUserRelationshipAttributes?.length === 0 ? (
                  <div>{t("Search attributes to add")}</div>
                ) : (
                  n?.orgUserRelationshipAttributes?.map((endorsement, j) => (
                    <DistrictDetail
                      onChangeEndorsement={onChangeEndorsement}
                      onRemoveEndorsement={onRemoveEndorsement}
                      endorsement={endorsement}
                    />
                  ))
                )}
              </Grid>
              <Grid item xs={4} container className={classes.inline}>
                <TextButton
                  className={classes.floatRight}
                  onClick={() =>
                    onRemoveOrg(n?.otherOrganization?.[i]?.id ?? "")
                  }
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
