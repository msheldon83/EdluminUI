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
} from "ui/routes/absence-reason";
import { Link } from "react-router-dom";
import { compact } from "lodash-es";
import { Table } from "ui/components/table";
import { Column } from "material-table";
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
import { PermissionEnum } from "graphql/server-types.gen";
import { Can } from "ui/components/auth/can";
import { GetAllAbsenceReasonCategoriesWithinOrg } from "./graphql/get-absence-reason-categories.gen";
import { mergeCatgoriesAndReasons } from "./helpers";
import { GroupedCategory } from "./types";
import { string } from "yup";

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
    const result = (
      <>
        <Grid
          item
          container
          key={`${i}-group`}
          className={classes.categoryTitle}
        >
          <Grid item xs={4}>
            {t(group.name)}
          </Grid>
          <Grid item xs={3}>
            {group.externalId}
          </Grid>
          <Grid item xs={3}>
            {group.allowNegativeBalance}
          </Grid>
          <Grid item xs={2}>
            {group.trackingType}
          </Grid>
        </Grid>
        {group.children?.map((c, x) => {
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
              <Grid item xs={4} className={classes.nameColumn}>
                {c.name}
              </Grid>
              <Grid item xs={3}>
                {c.externalId}
              </Grid>
              <Grid item xs={3}>
                {c.allowNegativeBalance}
              </Grid>
              <Grid item xs={2}>
                {c.absenceReasonTrackingTypeId}
              </Grid>
            </Grid>
          );
        })}
      </>
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
        alignItems="flex-start"
        justify="space-between"
        spacing={2}
        className={classes.header}
      >
        <Grid item xs={8}>
          <PageTitle title={t("Absence Reasons")} />
        </Grid>
        <Can do={[PermissionEnum.AbsVacSettingsSave]}>
          <Grid item xs={2}>
            <Button
              variant="contained"
              component={Link}
              to={AbsenceReasonCategoryAddRoute.generate(params)}
            >
              {t("Add Category")}
            </Button>
          </Grid>
          <Grid item xs={2}>
            <Button
              variant="contained"
              component={Link}
              to={AbsenceReasonAddRoute.generate(params)}
            >
              {t("Add Reason")}
            </Button>
          </Grid>
        </Can>
      </Grid>
      <Grid item container className={classes.tableHeader}>
        <Grid
          className={classes.reasonCount}
          item
          xs={9}
        >{`${absenceReasonsCount} ${t("Absence Reasons")}`}</Grid>
        <Grid item xs={3}>
          Search
        </Grid>
      </Grid>

      <Grid item container className={classes.tableHeader} justify="flex-end">
        <Grid item>
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
          {t("External Id")}
        </Grid>
        <Grid item xs={3} className={classes.columnTitle}>
          {t("Allow Negative Balances")}
        </Grid>
        <Grid item xs={2} className={classes.columnTitle}>
          {t("Tracking Type")}
        </Grid>
      </Grid>
      <Grid item container>
        {groupedAbsenceReasons.map((g, i) => {
          return displayAbsenceReasonGroup(g, i);
        })}
      </Grid>
      {/* <Table
        title={`${absenceReasonsCount} ${t("Absence Reasons")}`}
        columns={columns}
        data={absenceReasons}
        selection={false}
        onRowClick={(event, absenceReason) => {
          if (!absenceReason) return;
          const newParams = {
            ...params,
            absenceReasonId: absenceReason.id,
          };
          history.push(AbsenceReasonViewEditRoute.generate(newParams));
        }}
        options={{
          search: true,
        }}
        showIncludeExpired={true}
        onIncludeExpiredChange={checked => {
          setIncludeExpired(checked);
        }}
        expiredRowCheck={(rowData: GetAllAbsenceReasonsWithinOrg.All) =>
          rowData.expired
        }
      />*/}
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
    paddingTop: theme.typography.pxToRem(18),
    paddingBottom: theme.typography.pxToRem(18),
    paddingLeft: theme.typography.pxToRem(24),
    paddingRight: theme.typography.pxToRem(8),
  },
  alternateRow: {
    cursor: "pointer",
    color: theme.customColors.darkGray,
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    paddingLeft: theme.typography.pxToRem(24),
    paddingRight: theme.typography.pxToRem(8),
    paddingTop: theme.typography.pxToRem(18),
    paddingBottom: theme.typography.pxToRem(18),
  },
  categoryTitle: {
    color: theme.customColors.darkBlue,
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    backgroundColor: theme.customColors.yellow4,
    paddingTop: theme.typography.pxToRem(18),
    paddingBottom: theme.typography.pxToRem(18),
    paddingLeft: theme.typography.pxToRem(24),
    paddingRight: theme.typography.pxToRem(8),
  },
  nameColumn: {
    paddingLeft: theme.typography.pxToRem(20),
  },
}));
