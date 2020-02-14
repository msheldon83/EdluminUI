import * as React from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import {
  useQueryParamIso,
  makeQueryIso,
  PaginationParams,
} from "hooks/query-params";
import { PaginationControls } from "ui/components/pagination-controls";
import { usePagedQueryBundle } from "graphql/hooks";
import { GetAllPeopleForOrg } from "ui/pages/people/graphql/get-all-people-for-org.gen";
import { OrgUserRole, PermissionEnum } from "graphql/server-types.gen";
import { compact, remove } from "lodash-es";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import { Grid, Typography } from "@material-ui/core";
import { TextButton } from "ui/components/text-button";
import { Input } from "ui/components/form/input";
import { useDeferredState } from "hooks";
import {
  FilterQueryParams,
  FilterRole,
  RoleSpecificFilters,
} from "ui/pages/people/people-filters/filter-params";
import { useEffect, useMemo } from "react";
import { Can } from "../auth/can";

type Props = {
  title: string;
  isLocationOnly: boolean;
  orgId: string;
  onAdd: (orgUser: any) => void;
  onBlock: (orgUser: any) => void;
  onAutoAssign?: (orgUser: any) => void;
  takenSubstitutes: any[];
  addToFavoritePermission: PermissionEnum[];
  addToBlockedPermission: PermissionEnum[];
};

export const SubstitutePicker: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const peoplePaginationDefaults = makeQueryIso({
    defaults: {
      page: "1",
      limit: "25",
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

  const [allSubstitutesQuery, pagination] = usePagedQueryBundle(
    GetAllPeopleForOrg,
    r => r.orgUser?.paged?.totalCount,
    {
      variables: {
        ...isoFilters,
        orgId: props.orgId,
        //locations: [props.locationId], -Not sure if we need to filter this list by location
        role: [OrgUserRole.ReplacementEmployee],
        sortBy: [
          {
            sortByPropertyName: "lastName",
            sortAscending: true,
          },
          {
            sortByPropertyName: "firstName",
            sortAscending: true,
          },
        ],
      },
    },
    peoplePaginationDefaults
  );

  let substitutes: GetAllPeopleForOrg.Results[] = [];
  if (
    allSubstitutesQuery.state === "DONE" ||
    allSubstitutesQuery.state === "UPDATING"
  ) {
    const qResults = compact(allSubstitutesQuery.data?.orgUser?.paged?.results);
    if (qResults) substitutes = qResults;
  }

  if (
    allSubstitutesQuery.state === "LOADING" ||
    !allSubstitutesQuery.data.orgUser?.paged?.results
  ) {
    return <></>;
  }

  const usedSubs = remove(
    substitutes,
    s =>
      props.takenSubstitutes.filter(t => {
        return t.id === s.id;
      }).length > 0
  );

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
          <Grid item xs={6} className={classes.filters}>
            <Input
              label={t("Search")}
              value={pendingName}
              onChange={updateNameFilter}
              placeholder={t("First or last name")}
            />
          </Grid>

          {substitutes.length === 0 && (
            <Grid item xs={12} className={classes.noResultRow}>
              <Typography>{t("No Substitutes")}</Typography>
            </Grid>
          )}
          {substitutes.map((user, i) => {
            const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`;
            const className = [
              classes.detail,
              i % 2 == 1 ? classes.shadedRow : classes.nonShadedRow,
            ].join(" ");

            return (
              <Grid item className={className} xs={12} key={i}>
                <Typography className={classes.userName}>{name}</Typography>
                <Can do={props.addToBlockedPermission}>
                  <TextButton
                    className={classes.blockActionLink}
                    onClick={() => props.onBlock(user)}
                  >
                    {t("Block")}
                  </TextButton>
                </Can>
                <Can do={props.addToFavoritePermission}>
                  <TextButton
                    className={classes.addActionLink}
                    onClick={() => props.onAdd(user)}
                  >
                    {t("Add")}
                  </TextButton>
                </Can>
                {props.isLocationOnly && props.onAutoAssign && (
                  <Can do={props.addToFavoritePermission}>
                    <TextButton
                      className={classes.addActionLink}
                      onClick={() => props.onAutoAssign!(user)}
                    >
                      {t("Auto Assign")}
                    </TextButton>
                  </Can>
                )}
              </Grid>
            );
          })}
          <Grid item xs={12} className={classes.pagination}>
            <PaginationControls
              pagination={pagination}
              pageSizeOptions={[25, 50, 100, 250, 500]}
            />
          </Grid>
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
  blockActionLink: {
    float: "right",
    color: theme.customColors.darkRed,
  },
  userName: {
    float: "left",
  },
  pagination: {
    float: "right",
  },
}));
