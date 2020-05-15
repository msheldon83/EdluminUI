import * as React from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import {
  useQueryParamIso,
  makeQueryIso,
  PaginationParams,
} from "hooks/query-params";
import { PaginationControls } from "ui/components/pagination-controls";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import { Can } from "ui/components/auth/can";
import { PermissionEnum } from "graphql/server-types.gen";
import { Grid, Typography } from "@material-ui/core";
import { TextButton } from "ui/components/text-button";
import { Input } from "ui/components/form/input";
import { useDeferredState } from "hooks";
import { FilterQueryParams } from "ui/pages/people/people-filters/filter-params";
import { useEffect } from "react";

type Props = {
  onAdd: (orgUserId: string) => void;
  suggestedAdmins: any[];
  savePermissions: PermissionEnum[];
};

export const AdminPicker: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { onAdd, suggestedAdmins, savePermissions } = props;

  const peoplePaginationDefaults = makeQueryIso({
    defaults: {
      page: "1",
      limit: "10",
    },
    iso: PaginationParams,
  });

  const [isoFilters, updateIsoFilters] = useQueryParamIso(FilterQueryParams);
  const [name, pendingName, setPendingName] = useDeferredState(
    isoFilters.name,
    200
  );

  useEffect(() => {
    if (name !== isoFilters.name) {
      setPendingName(isoFilters.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isoFilters.name]);

  useEffect(() => {
    if (name !== isoFilters.name) {
      updateIsoFilters({ name });
    }
  }, [name]); // eslint-disable-line

  const updateNameFilter = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingName(event.target.value);
    },
    [setPendingName]
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
              value={pendingName}
              onChange={updateNameFilter}
              placeholder={t("Search")}
            />
          </Grid>{" "}
          <Grid item xs={12}>
            <SectionHeader title={t("Suggested members")} />
          </Grid>
          {/*   <Grid item xs={12} className={classes.pagination}>
            <PaginationControls
              pagination={pagination}
              pageSizeOptions={[25, 50, 100, 250, 500]}
            />
          </Grid> */}
          {suggestedAdmins.length === 0 && (
            <Grid item xs={12} className={classes.noResultRow}>
              <Typography>{t("No suggested members")}</Typography>
            </Grid>
          )}
          {suggestedAdmins.map((user, i) => {
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
                    onClick={() => props.onAdd(user.id)}
                  >
                    {t("Add")}
                  </TextButton>
                </Can>
              </Grid>
            );
          })}
          {/* <Grid item xs={12} className={classes.pagination}>
              {/* <PaginationControls
              pagination={pagination}
              pageSizeOptions={[25, 50, 100, 250, 500]}
            /> 
            </Grid> */}
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
