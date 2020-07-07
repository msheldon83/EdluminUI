import * as React from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { makeQueryIso, PaginationParams } from "hooks/query-params";
import { PaginationControls } from "ui/components/pagination-controls";
import { usePagedQueryBundle } from "graphql/hooks";
import { GetSubstitutesForPreferences } from "./graphql/get-substitutes.gen";
import {
  PermissionEnum,
  ReplacementPoolMember,
} from "graphql/server-types.gen";
import { compact } from "lodash-es";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import { Grid, Typography } from "@material-ui/core";
import { TextButton } from "ui/components/text-button";
import { Input } from "ui/components/form/input";
import { useDeferredState } from "hooks";
import { Can } from "../auth/can";
import { SubstituteLink } from "ui/components/links/people";

type Props = {
  title: string;
  orgId: string;
  onAdd: (orgUser: any) => void;
  onBlock: (orgUser: any) => void;
  takenSubstitutes: ReplacementPoolMember[];
  addToFavoritePermission: PermissionEnum[];
  addToBlockedPermission: PermissionEnum[];
  autoAssign?: {
    onAdd: (orgUser: any) => void;
    addPermission: PermissionEnum[];
  };
};

export const SubstitutePicker: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const subPickerPaginationDefaults = makeQueryIso({
    defaults: {
      page: "1",
      limit: "10",
    },
    iso: PaginationParams,
  });

  const [
    searchText,
    pendingSearchText,
    setPendingSearchText,
  ] = useDeferredState<string | undefined>("", 200);

  const [allSubstitutesQuery, pagination] = usePagedQueryBundle(
    GetSubstitutesForPreferences,
    r => r.orgUser?.pagedSubsForPreferences?.totalCount,
    {
      variables: {
        orgId: props.orgId,
        name: searchText,
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
    subPickerPaginationDefaults
  );

  const updateNameFilter = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      pagination.resetPage();
      setPendingSearchText(event.target.value);
    },
    [setPendingSearchText, pagination]
  );

  let substitutes: GetSubstitutesForPreferences.Results[] = [];
  if (
    allSubstitutesQuery.state === "DONE" ||
    allSubstitutesQuery.state === "UPDATING"
  ) {
    const qResults = compact(
      allSubstitutesQuery.data?.orgUser?.pagedSubsForPreferences?.results
    );
    if (qResults)
      substitutes = qResults.filter(
        e => !props.takenSubstitutes.find(x => x.employeeId === e.id)
      );
  }

  if (
    allSubstitutesQuery.state === "LOADING" ||
    !allSubstitutesQuery.data.orgUser?.pagedSubsForPreferences?.results
  ) {
    return <></>;
  }

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
              value={pendingSearchText}
              onChange={updateNameFilter}
              placeholder={t("First or last name")}
            />
          </Grid>
          <Grid item xs={12} className={classes.pagination}>
            <PaginationControls
              pagination={pagination}
              pageSizeOptions={[25, 50, 100, 250, 500]}
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
                <Typography className={classes.userName}>
                  <SubstituteLink orgUserId={user.id} color="black">
                    {name}
                  </SubstituteLink>
                </Typography>
                <Can do={props.addToBlockedPermission}>
                  <TextButton
                    className={classes.blockActionLink}
                    onClick={() =>
                      props.onBlock({
                        employeeId: user.id,
                        employee: {
                          firstName: user.firstName,
                          lastName: user.lastName,
                          id: user.id,
                        },
                      } as ReplacementPoolMember)
                    }
                  >
                    {t("Block")}
                  </TextButton>
                </Can>
                <Can do={props.addToFavoritePermission}>
                  <TextButton
                    className={classes.addActionLink}
                    onClick={() =>
                      props.onAdd({
                        employeeId: user.id,
                        employee: {
                          firstName: user.firstName,
                          lastName: user.lastName,
                          id: user.id,
                        },
                      } as ReplacementPoolMember)
                    }
                  >
                    {t("Add favorite")}
                  </TextButton>
                </Can>
                {props.autoAssign && (
                  <Can do={props.autoAssign.addPermission}>
                    <TextButton
                      className={classes.addAutoAssignActionLink}
                      onClick={() =>
                        props.autoAssign!.onAdd({
                          employeeId: user.id,
                          employee: {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            id: user.id,
                          },
                        } as ReplacementPoolMember)
                      }
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
  addAutoAssignActionLink: {
    float: "right",
    color: theme.customColors.blue,
    paddingRight: theme.spacing(),
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
