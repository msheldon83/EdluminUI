import { useTheme } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import {
  AbsenceReasonRoute,
  AbsenceReasonAddRoute,
  AbsenceReasonViewEditRoute,
} from "ui/routes/absence/reason";
import { Link } from "react-router-dom";
import { compact } from "lodash-es";
import { Table } from "ui/components/table";
import { Column } from "material-table";
import { DeleteAbsenceReason } from "ui/pages/absence-reason/graphql/delete-absence-reason.gen";
import { GetAllAbsenceReasonsWithinOrg } from "ui/pages/absence-reason/graphql/get-absence-reasons.gen";
import { useRouteParams } from "ui/routes/definition";
import { Button, Grid, makeStyles } from "@material-ui/core";

export const AbsenceReason: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(AbsenceReasonRoute);
  const [includeExpired, setIncludeExpired] = React.useState(false);

  const getAbsenceReasons = useQueryBundle(GetAllAbsenceReasonsWithinOrg, {
    variables: { orgId: params.organizationId, includeExpired },
  });
  const [deleteAbsenceReaonsMutation] = useMutationBundle(DeleteAbsenceReason);
  const deleteAbsenceReason = (absenceReasonId: string) => {
    return deleteAbsenceReaonsMutation({
      variables: {
        absenceReasonId: Number(absenceReasonId),
      },
    });
  };

  const deleteSelected = async (data: { id: string } | { id: string }[]) => {
    if (Array.isArray(data)) {
      await Promise.all(data.map(id => deleteAbsenceReason(id.id)));
    } else {
      await Promise.resolve(deleteAbsenceReason(data.id));
    }
    await getAbsenceReasons.refetch();
  };

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
      title: t("Description"),
      field: "description",
      searchable: true,
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
        <Grid item>
          <Button
            variant="contained"
            component={Link}
            to={AbsenceReasonAddRoute.generate(params)}
          >
            {t("Add Absence Reason")}
          </Button>
        </Grid>
      </Grid>
      <Table
        title={`${absenceReasonsCount} ${t("Absence Reasons")}`}
        columns={columns}
        data={absenceReasons}
        selection={!isMobile}
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
        actions={[
          {
            tooltip: `${t("Delete selected pay codes")}`,
            icon: () => <DeleteOutline /> /* eslint-disable-line */, // This should be able to be "delete" as a string which will use the table delete icon, but that didn't work for some reason
            onClick: async (event, data) => {
              await deleteSelected(data);
            },
          },
        ]}
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
