import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { useTranslation } from "react-i18next";
import { Table } from "ui/components/table";
import { Column } from "material-table";
import { compact } from "lodash-es";

export const CRMSubscription = () => {
  const classes = useStyles();

  return (
    <React.Fragment>
      <div className={classes.container}>
        <div className={classes.header}>Subscription for 2020-21</div>
        <table className={classes.subscriptionTable}>
          <thead className={classes.evenRow}>
            <td>Item</td>
            <td>Rate</td>
            <td>Qty</td>
            <td>In use</td>
            <td>Total /mo</td>
          </thead>
          <tbody>
            <tr className={classes.oddRow}>
              <td>Employees requiring a substitute</td>
              <td>$1.53/mo</td>
              <td>203</td>
              <td>200 (-3)</td>
              <td>$310.59</td>
            </tr>
            <tr className={classes.evenRow}>
              <td>Employees not requiring a substitute</td>
              <td>$0.73/mo</td>
              <td>0</td>
              <td>5 (+5)</td>
              <td>$0.00</td>
            </tr>
            <tr className={classes.oddRow}>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>$310.59</td>
            </tr>
          </tbody>
        </table>
      </div>
    </React.Fragment>
  );
};

/*export const CRMSubscriptionReact = () => {
  const { t } = useTranslation();

  const [getWorkDaySchedules, pagination] = usePagedQueryBundle(
    GetAllWorkDaySchedulesWithinOrg,
    r => r.workDaySchedule?.paged?.totalCount,
    {
      variables: { orgId: params.organizationId, includeExpired },
    }
  );

  const columns: Column<Record<string, any>>[] = [
    {
      title: t("Name"),
    },
    {
      title: t("Identifier"),
    },
    {
      title: t("In Use"),
    },
    {
      title: t("# of Periods"),
    },
  ];

  const tableData = [Object, Object, Object];

  const workDaySchedules = compact(
    getWorkDaySchedules?.data?.workDaySchedule?.paged?.results ?? []
  );

  <Table
    title={"Hello title"}
    columns={columns}
    data={tableData}
    selection={false}
    options={{
      search: false,
      sorting: true,
    }}
  />;
};*/

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: "#FFFFFF",
  },
  header: {
    fontSize: "24px",
    lineHeight: "36px",
  },
  subscriptionTable: {
    border: "1px solid black",
  },
  evenRow: {
    backgroundColor: "#E5E5E5",
  },
  oddRow: {
    backgroundColor: "#FFFFFF",
  },
}));
