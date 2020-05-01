import * as React from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { PermissionEnum, OrgUser } from "graphql/server-types.gen";
import { Can } from "../auth/can";
import { SubstituteLink } from "ui/components/links/people";

type Props = {
  title: string;
  orgUsers?: OrgUser[] | null;
  blocked: boolean;
  onRemove: (orgUser: OrgUser) => void;
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
          {props.orgUsers?.length === 0 ? (
            <Grid item xs={12}>
              <Typography>{t("Not Defined")}</Typography>
            </Grid>
          ) : (
            props.orgUsers?.map((user, i) => {
              const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`;
              const className = [
                classes.detail,
                i % 2 == 1 ? classes.shadedRow : undefined,
              ].join(" ");
              return (
                <Grid item className={className} xs={12} key={i}>
                  <Typography className={classes.userName}>
                    <SubstituteLink orgUserId={user.id} color="black">
                      {name}
                    </SubstituteLink>
                  </Typography>
                  <Can do={props.removePermission}>
                    <TextButton
                      className={classes.actionLink}
                      onClick={() => props.onRemove(user)}
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
  userName: {
    float: "left",
  },
}));
