import { useIsMobile } from "hooks";
import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import {
  AbsenceReasonRoute,
  AbsenceReasonAddRoute,
  AbsenceReasonCategoryAddRoute,
  AbsenceReasonViewEditRoute,
  AbsenceReasonCategoryViewEditRoute,
} from "ui/routes/absence-reason";
import { Link } from "react-router-dom";
import { compact, sortBy } from "lodash-es";
import { GetAllAbsenceReasonsWithinOrg } from "ui/pages/absence-reason/graphql/get-absence-reasons.gen";
import { useRouteParams } from "ui/routes/definition";
import {
  Button,
  Grid,
  makeStyles,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@material-ui/core";
import { PermissionEnum, DataImportType } from "graphql/server-types.gen";
import { Can } from "ui/components/auth/can";
import { GetAllAbsenceReasonCategoriesWithinOrg } from "./graphql/get-absence-reason-categories.gen";
import { mergeCatgoriesAndReasons } from "./helpers";
import { GroupedCategory } from "./types";
import { Check, Minimize } from "@material-ui/icons";
import { getDisplayName } from "ui/components/enumHelpers";
import { ImportDataMultiButton } from "ui/components/data-import/import-data-multi-button";

export const AbsenceReason: React.FC<{}> = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(AbsenceReasonRoute);
  const [includeExpired, setIncludeExpired] = React.useState(false);

  const getAbsenceReasons = useQueryBundle(GetAllAbsenceReasonsWithinOrg, {
    variables: { orgId: params.organizationId, includeExpired },
  });

  const getAbsenceReasonCategories = useQueryBundle(
    GetAllAbsenceReasonCategoriesWithinOrg,
    {
      variables: { orgId: params.organizationId, includeExpired },
    }
  );

  if (
    getAbsenceReasons.state === "LOADING" ||
    getAbsenceReasonCategories.state === "LOADING"
  ) {
    return <></>;
  }

  const displayAbsenceReasonGroup = (group: GroupedCategory, i: number) => {
    const sortedChildren = sortBy(group.children, [c => c.name]);
    const result = (
      <React.Fragment key={i}>
        <Grid
          item
          container
          key={`${i}-group`}
          className={classes.categoryTitle}
          onClick={() => {
            if (group.id !== "0") {
              const newParams = {
                ...params,
                absenceReasonCategoryId: group.id,
              };
              history.push(
                AbsenceReasonCategoryViewEditRoute.generate(newParams)
              );
            }
          }}
        >
          <Grid item xs={4}>
            {t(group.name)}
          </Grid>
          <Grid item xs={3}>
            {group.externalId}
          </Grid>
          {group.allowNegativeBalance ? (
            <Grid item xs={3} className={classes.negativeBalanceColCheck}>
              <Check />
            </Grid>
          ) : (
            <Grid item xs={3} className={classes.negativeBalanceColMin}>
              <Minimize />
            </Grid>
          )}
        </Grid>
        {sortedChildren.map((c, x) => {
          return (
            <Grid
              item
              container
              className={x % 2 !== 0 ? classes.row : classes.alternateRow}
              key={`${i}-${x}-abs-reason`}
              onClick={() => {
                const newParams = {
                  ...params,
                  absenceReasonId: c.id,
                };
                history.push(AbsenceReasonViewEditRoute.generate(newParams));
              }}
            >
              <Grid
                item
                xs={4}
                className={
                  group.name == "Uncategorized" ? "" : classes.nameColumn
                }
              >
                {c.name}
              </Grid>
              <Grid item xs={3}>
                {c.externalId}
              </Grid>
              {c.allowNegativeBalance ? (
                <Grid item xs={3} className={classes.negativeBalanceColCheck}>
                  <Check />
                </Grid>
              ) : (
                <Grid item xs={3} className={classes.negativeBalanceColMin}>
                  <Minimize />
                </Grid>
              )}
            </Grid>
          );
        })}
      </React.Fragment>
    );
    return result;
  };

  const absenceReasons = compact(
    getAbsenceReasons?.data?.orgRef_AbsenceReason?.all ?? []
  );

  const absenceReasonCategories = compact(
    getAbsenceReasonCategories?.data?.orgRef_AbsenceReasonCategory?.all ?? []
  );

  const absenceReasonsCount = absenceReasons.length;

  const groupedAbsenceReasons = mergeCatgoriesAndReasons(
    absenceReasonCategories,
    absenceReasons
  );

  return (
    <>
      <Grid
        container
        alignItems="center"
        justify="space-between"
        spacing={2}
        className={classes.header}
      >
        <Grid item xs={6}>
          <PageTitle title={t("Absence Reasons")} />
        </Grid>
        <Can do={[PermissionEnum.AbsVacSettingsSave]}>
          <Grid item xs={2}>
            <ImportDataMultiButton
              orgId={params.organizationId}
              importTypes={[
                {
                  importType: DataImportType.AbsenceReason,
                  label: t("Reasons"),
                },
                {
                  importType: DataImportType.AbsenceReasonCategory,
                  label: t("Categories"),
                },
              ]}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              variant="outlined"
              component={Link}
              to={AbsenceReasonCategoryAddRoute.generate(params)}
              fullWidth
            >
              {t("Add Category")}
            </Button>
          </Grid>
          <Grid item xs={2}>
            <Button
              variant="contained"
              component={Link}
              to={AbsenceReasonAddRoute.generate(params)}
              fullWidth
            >
              {t("Add Reason")}
            </Button>
          </Grid>
        </Can>
      </Grid>
      <Grid
        item
        container
        className={[classes.tableHeader, classes.firstRow].join(" ")}
      >
        <Grid
          className={classes.reasonCount}
          item
          xs={9}
        >{`${absenceReasonsCount} ${t("Absence Reasons")}`}</Grid>
        <Grid item xs={3}>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeExpired}
                onChange={async e => {
                  setIncludeExpired(e.target.checked);
                }}
                value={includeExpired}
                color="primary"
              />
            }
            label={
              <Typography variant="h6">{t("Include inactive")}</Typography>
            }
          />
        </Grid>
      </Grid>

      <Grid item container className={classes.tableHeader}>
        <Grid item xs={4} className={classes.columnTitle}>
          {t("Name")}
        </Grid>
        <Grid item xs={3} className={classes.columnTitle}>
          {t("Identifier")}
        </Grid>
        <Grid item xs={3} className={classes.columnTitle}>
          {t("Allow Negative Balances")}
        </Grid>
      </Grid>
      <Grid item container>
        {groupedAbsenceReasons.map((g, i) => {
          return displayAbsenceReasonGroup(g, i);
        })}
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(),
  },
  tableHeader: {
    backgroundColor: theme.customColors.white,
    paddingLeft: theme.typography.pxToRem(24),
    paddingRight: theme.typography.pxToRem(8),
    paddingBottom: theme.typography.pxToRem(10),
  },
  firstRow: {
    paddingTop: theme.typography.pxToRem(10),
    paddingBottom: theme.typography.pxToRem(25),
  },
  reasonCount: {
    fontSize: "1.5rem",
    lineHeight: "2.25rem",
    paddingBottom: theme.typography.pxToRem(8),
  },
  columnTitle: {
    color: theme.customColors.darkGray,
    fontSize: "0.9375rem",
    fontWeight: 600,
    letterSpacing: "0.015625rem",
    lineHeight: "1.5rem",
  },
  includeInactive: {
    textAlign: "right",
  },
  row: {
    cursor: "pointer",
    color: theme.customColors.darkGray,
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    backgroundColor: theme.customColors.white,
    paddingTop: theme.typography.pxToRem(12),
    paddingBottom: theme.typography.pxToRem(11),
    paddingLeft: theme.typography.pxToRem(24),
    paddingRight: theme.typography.pxToRem(8),
    lineHeight: theme.typography.pxToRem(28),
  },
  alternateRow: {
    cursor: "pointer",
    color: theme.customColors.darkGray,
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    paddingLeft: theme.typography.pxToRem(24),
    paddingRight: theme.typography.pxToRem(8),
    paddingTop: theme.typography.pxToRem(12),
    paddingBottom: theme.typography.pxToRem(11),
    lineHeight: theme.typography.pxToRem(28),
  },
  categoryTitle: {
    cursor: "pointer",
    color: theme.customColors.darkBlue,
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    backgroundColor: "#E5E5E5",
    paddingTop: theme.typography.pxToRem(12),
    paddingBottom: theme.typography.pxToRem(8),
    paddingLeft: theme.typography.pxToRem(24),
    paddingRight: theme.typography.pxToRem(8),
    lineHeight: theme.typography.pxToRem(28),
  },
  nameColumn: {
    paddingLeft: theme.typography.pxToRem(20),
  },
  negativeBalanceColCheck: {
    paddingLeft: theme.typography.pxToRem(50),
    marginBottom: theme.typography.pxToRem(-5),
  },
  negativeBalanceColMin: {
    paddingLeft: theme.typography.pxToRem(50),
    marginTop: theme.typography.pxToRem(-8),
  },
  trackingCol: {
    paddingLeft: theme.typography.pxToRem(3),
  },
  importButton: {
    marginTop: theme.spacing(1),
  },
}));
