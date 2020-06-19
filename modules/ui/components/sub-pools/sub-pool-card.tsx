import * as React from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import {
  PermissionEnum,
  ReplacementPoolMember,
} from "graphql/server-types.gen";
import { Can } from "../auth/can";
import clsx from "clsx";
import { SubstituteLink } from "ui/components/links/people";

type Props = {
  title: string;
  replacementPoolMembers?: ReplacementPoolMember[] | null;
  onRemove: (member: ReplacementPoolMember) => void;
  removePermission: PermissionEnum[];
};

export const SubPoolCard: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

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
          {props.replacementPoolMembers?.length === 0 ? (
            <Grid item xs={12}>
              <Typography>{t("Not Defined")}</Typography>
            </Grid>
          ) : (
            props.replacementPoolMembers?.map((member, i) => {
              return (
                <Grid
                  item
                  className={clsx({
                    [classes.detail]: true,
                    [classes.shadedRow]: i % 2 == 1,
                  })}
                  xs={12}
                  key={i}
                >
                  <Typography className={classes.userName}>
                    <SubstituteLink orgUserId={member.id} color="black">
                      {member?.employee?.firstName ?? ""}{" "}
                      {member?.employee?.lastName ?? ""}
                    </SubstituteLink>
                  </Typography>
                  <Can do={props.removePermission}>
                    <TextButton
                      className={classes.actionLink}
                      onClick={() => props.onRemove(member)}
                    >
                      {t("Remove")}
                    </TextButton>
                  </Can>
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
    paddingLeft: theme.spacing(2),
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
  userName: {
    float: "left",
  },
}));
