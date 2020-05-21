import * as React from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import { Can } from "ui/components/auth/can";
import { PermissionEnum, OrgUser } from "graphql/server-types.gen";
import Maybe from "graphql/tsutils/Maybe";
import { Grid, Typography } from "@material-ui/core";
import { TextButton } from "ui/components/text-button";
import { Input } from "ui/components/form/input";
import { useDeferredState } from "hooks";
import { useEffect } from "react";

type Props = {
  onAdd: (orgUserId: string) => void;
  admins: Pick<OrgUser, "id" | "firstName" | "lastName">[] | undefined;
  savePermissions: PermissionEnum[];
  setSearchText: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const AdminPicker: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { onAdd, admins, savePermissions, setSearchText } = props;

  const [
    searchText,
    pendingSearchText,
    setPendingSearchText,
  ] = useDeferredState<string | undefined>(undefined, 300);
  useEffect(() => {
    setSearchText(searchText);
  }, [setSearchText, searchText]);

  const updateSearchText = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingSearchText(event.target.value);
    },
    [setPendingSearchText]
  );

  return (
    <>
      <Section>
        <SectionHeader title={t("Search all administrators")} />
        <Grid
          container
          justify="space-between"
          alignItems="center"
          direction="row"
        >
          <Grid item xs={6} className={classes.filters}>
            <Input
              value={pendingSearchText}
              onChange={updateSearchText}
              placeholder={t("Search")}
            />
          </Grid>
          <Grid item xs={12}>
            <SectionHeader title={t("Suggested members")} />
          </Grid>
          {admins?.length === 0 && (
            <Grid item xs={12} className={classes.noResultRow}>
              <Typography>{t("No suggested members")}</Typography>
            </Grid>
          )}
          {admins?.map((user, i) => {
            const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`;
            const className = [
              classes.detail,
              i % 2 ? classes.shadedRow : classes.nonShadedRow,
            ].join(" ");
            return (
              <Grid item className={className} xs={12} key={i}>
                <Typography className={classes.userName}>{name}</Typography>
                <Can do={savePermissions}>
                  <TextButton
                    className={classes.addActionLink}
                    onClick={() => onAdd(user.id)}
                  >
                    {t("Add")}
                  </TextButton>
                </Can>
              </Grid>
            );
          })}
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
  noResultRow: {
    borderTop: `1px solid ${theme.customColors.medLightGray}`,
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  nonShadedRow: {
    borderTop: `1px solid ${theme.customColors.medLightGray}`,
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
  },
  filters: {
    marginBottom: theme.spacing(2),
  },
  detail: {
    padding: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    "@media print": {
      padding: 0,
    },
  },
  addActionLink: {
    float: "right",
    color: theme.customColors.blue,
  },
  userName: {
    float: "left",
  },
  pagination: {
    float: "right",
  },
}));
