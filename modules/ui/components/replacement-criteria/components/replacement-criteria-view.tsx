import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";

type Props = {
  label: string;
  attributes: Endorsement[];
  remove?: void;
};

type Endorsement = {
  id: string;
  name: string;
};

export const ReplacementCriteriaView: React.FC<Props> = props => {
  const { t } = useTranslation();

  //Remove Funciton Included on the row

  return (
    <>
      <Grid item xs={12}>
        <Section>
          <SectionHeader title={t(props.label)} />
          <hr />
          <Grid item xs={12} sm={6} lg={6}>
            {props.attributes?.length === 0 ? (
              <div>{t("Not defined")}</div>
            ) : (
              props.attributes?.map((n, i) => <div key={i}>{n?.name}</div>)
            )}
          </Grid>
        </Section>
      </Grid>
    </>
  );
};
