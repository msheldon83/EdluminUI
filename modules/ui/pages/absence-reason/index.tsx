import { useIsMobile } from "hooks";
import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import {
  AbsenceReasonRoute,
  AbsenceReasonAddRoute,
  AbsenceReasonViewEditRoute,
} from "ui/routes/absence-reason";
import { Link } from "react-router-dom";
import { compact } from "lodash-es";
import { Table } from "ui/components/table";
import { Column } from "material-table";
import { GetAllAbsenceReasonsWithinOrg } from "ui/pages/absence-reason/graphql/get-absence-reasons.gen";
import { useRouteParams } from "ui/routes/definition";
import { Button, Grid, makeStyles } from "@material-ui/core";
import { PermissionEnum } from "graphql/server-types.gen";
import { Can } from "ui/components/auth/can";

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

  const columns: Column<GetAllAbsenceReasonsWithinOrg.All>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
    },
    {
      title: t("External Id"),
      field: "externalId",
      searchable: true,
      hidden: isMobile,
    },
    {
      title: t("Restricted"),
      field: "isRestricted",
      type: "boolean",
      searchable: false,
      hidden: isMobile,
    },
  ];

  if (getAbsenceReasons.state === "LOADING") {
    return <></>;
  }

  const absenceReasons = compact(
    getAbsenceReasons?.data?.orgRef_AbsenceReason?.all ?? []
  );
  const absenceReasonsCount = absenceReasons.length;

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        justify="space-between"
        spacing={2}
        className={classes.header}
      >
        <Grid item>
          <PageTitle title={t("Absence Reasons")} />
        </Grid>
        <Can do={[PermissionEnum.AbsVacSettingsSave]}>
          <Grid item>
            <Button
              variant="contained"
              component={Link}
              to={AbsenceReasonAddRoute.generate(params)}
            >
              {t("Add Absence Reason")}
            </Button>
          </Grid>
        </Can>
      </Grid>
      <Table
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
      />
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
}));
