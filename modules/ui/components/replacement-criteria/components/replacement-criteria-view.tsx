import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";

type Props = {
  label: string;
  attributes: Endorsement[];
  remove: (id: string[]) => Promise<boolean>;
};

type Endorsement = {
  id: string;
  name: string;
};

export const ReplacementCriteriaView: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const removeEndorsement = (endorsement: Endorsement) => {
    return [...props.attributes].filter(e => e !== endorsement).map(a => a.id);
  };

  return (
    <>
      <Grid item xs={12}>
        <Section>
          <SectionHeader title={t(props.label)} />
          <Grid item xs={12} sm={12} lg={12}>
            {props.attributes?.length === 0 ? (
              <div className={classes.allOrNoneRow}>{t("No Attributes")}</div>
            ) : (
              props.attributes?.map((n, i) => (
                <div
                  key={i}
                  className={`${classes.endorsementRow} ${getRowClasses(
                    classes,
                    i
                  )}`}
                >
                  <div>{t(n.name)}</div>
                  <div>
                    <TextButton
                      className={classes.link}
                      onClick={() => props.remove(removeEndorsement(n))}
                    >
                      {t("Remove")}
                    </TextButton>
                  </div>
                </div>
              ))
            )}
          </Grid>
        </Section>
      </Grid>
    </>
  );
};
const useStyles = makeStyles(theme => ({
  inlineFlex: {
    display: "inline-flex",
  },
  endorsementRow: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  link: {
    cursor: "pointer",
    textDecoration: "underline",
    color: theme.customColors.darkRed,
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
  allOrNoneRow: {
    color: theme.customColors.edluminSubText,
  },
  row: {
    width: "100%",
    padding: theme.spacing(),
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
