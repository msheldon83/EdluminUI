import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import { Link } from "react-router-dom";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";

type Props = {
  label: string;
  attributes: Endorsement[];
  remove: (id: string[]) => Promise<void>;
};

type Endorsement = {
  id: string;
  name: string;
};

export const ReplacementCriteriaView: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

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
              props.attributes?.map((n, i) => (
                <>
                  <div key={i}>{n?.name}</div>
                  <TextButton
                    //TODO: Style the rows. Mutations need to be set first
                    color="primary"
                    className={(classes.alignRight, classes.link)}
                    onClick={() => props.remove([n?.id])}
                  >
                    Remove
                  </TextButton>
                </>
              ))
            )}
          </Grid>
        </Section>
      </Grid>
    </>
  );
};
const useStyles = makeStyles(theme => ({
  inlineBlock: {
    display: "inline-block",
  },
  alignRight: {
    align: "right",
  },
  link: {
    textDecoration: "none",
    color: "red",
  },
}));
