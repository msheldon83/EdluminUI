import * as React from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { SubstituteLink } from "ui/components/links/people";

type Props = {
  title: string;
  values: OptionType[];
  blocked: boolean;
  onRemove?: (id: string) => void;
};

type OptionType = {
  label: string;
  value?: string;
};

export const SubPoolCard: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { values, onRemove } = props;

  return (
    <>
      <Section>
        <SectionHeader title={props.title} />
        <Grid
          container
          justify="space-between"
          alignItems="center"
          direction="row"
        >
          {props.values?.length === 0 ? (
            <Grid item xs={12}>
              <Typography>{t("Not Defined")}</Typography>
            </Grid>
          ) : (
            values?.map((value: any, i) => {
              const className = [
                classes.detail,
                i % 2 == 1 ? classes.shadedRow : undefined,
              ].join(" ");
              return (
                <Grid item className={className} xs={12} key={i}>
                  <Typography className={classes.label}>
                    <SubstituteLink orgUserId={value.value} color="black">
                      {value.label}
                    </SubstituteLink>
                  </Typography>
                  {value.value && onRemove && (
                    <TextButton
                      className={classes.actionLink}
                      onClick={() => onRemove(value?.value)}
                    >
                      {t("Remove")}
                    </TextButton>
                  )}
                </Grid>
              );
            })
          )}
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  shadedRow: {
    background: theme.customColors.lightGray,
    borderTop: `1px solid ${theme.customColors.medLightGray}`,
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
  },
  detail: {
    paddingLeft: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    "@media print": {
      paddingLeft: theme.spacing(),
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
    },
  },
  actionLink: {
    float: "right",
    color: theme.customColors.darkRed,
  },
  label: {
    float: "left",
  },
}));
