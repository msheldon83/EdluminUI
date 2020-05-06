import * as React from "react";
import { Divider, Grid, makeStyles } from "@material-ui/core";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { OptionType } from "ui/components/form/select-new";
import { useState } from "react";
import { Section } from "ui/components/section";
import clsx from "clsx";
import { Maybe } from "graphql/server-types.gen";
import { CustomOrgUserRelationship, CustomEndorsement } from "../helpers";
import { SectionHeader } from "ui/components/section-header";
import { AutoCompleteSearch } from "ui/components/autocomplete-search";
import { DistrictDetail } from "./district-detail";

type Props = {
  orgUserRelationships: Maybe<CustomOrgUserRelationship>[] | undefined | null;
  orgEndorsements: OptionType[];
  onRemoveOrg: (orgId: string) => Promise<unknown>;
  onAddEndorsement: (endorsementId: string, orgId?: string) => Promise<void>;
  onChangeEndorsement: (arg0: CustomEndorsement) => Promise<void>;
  onRemoveEndorsement: (arg0: CustomEndorsement) => Promise<void>;
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
    orgEndorsements,
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
      {orgUserRelationships?.length === 0 ? (
        <div>{t("No selected districts")}</div>
      ) : (
        orgUserRelationships?.map((n, i) => (
          <div key={i}>
            <Grid
              item
              xs={12}
              className={clsx({
                [classes.background]: i % 2,
              })}
            >
              <Grid item xs={4} container className={classes.inline}>
                <div className={classes.paddingLeft}>
                  {n?.otherOrganization?.name}
                </div>
              </Grid>
              <Grid item xs={4} container className={classes.inline}>
                <AutoCompleteSearch
                  searchText={searchText}
                  onClick={onAddEndorsement}
                  options={orgEndorsements}
                  setSearchText={setSearchText}
                  placeholder={t("search")}
                  useLabel={false}
                  orgId={n?.otherOrganization?.orgId}
                />
                {n?.attributes?.length === 0 ? (
                  <div></div>
                ) : (
                  n?.attributes?.map((endorsement: any, j) => (
                    <DistrictDetail
                      key={j}
                      onChangeEndorsement={onChangeEndorsement}
                      onRemoveEndorsement={onRemoveEndorsement}
                      endorsement={endorsement?.endorsement}
                      expirationDate={endorsement?.expirationDate}
                      orgId={n.otherOrganization?.orgId ?? ""}
                    />
                  ))
                )}
              </Grid>
              <Grid item xs={4} container className={classes.inline}>
                <TextButton
                  className={clsx({
                    [classes.padding]: true,
                    [classes.floatRight]: true,
                  })}
                  onClick={() => onRemoveOrg(n?.otherOrganization?.id ?? "")}
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
  inline: {
    display: "inline-block",
  },
  floatRight: {
    float: "right",
  },
  padding: {
    padding: theme.spacing(2),
  },
  paddingLeft: {
    paddingLeft: theme.spacing(2),
  },
  background: {
    backgroundColor: theme.customColors.lightGray,
  },
}));
