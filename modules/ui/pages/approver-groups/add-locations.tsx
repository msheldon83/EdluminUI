import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { Grid, Typography, Tooltip } from "@material-ui/core";
import {
  PermissionEnum,
  ApproverGroupCreateInput,
} from "graphql/server-types.gen";
import { ViewCard } from "./components/view-card";
import { useIsMobile } from "hooks";
import { useRouteParams } from "ui/routes/definition";
import ErrorIcon from "@material-ui/icons/Error";
import { Table } from "ui/components/table";
import { Link } from "react-router-dom";
import { PageTitle } from "ui/components/page-title";
import { Column } from "material-table";
import { compact } from "lodash-es";
import * as Yup from "yup";
import { useHistory } from "react-router";
import { useMemo } from "react";
import { useLocations } from "reference-data/locations";
import { useTranslation } from "react-i18next";
import {
  ApproverGroupsRoute,
  ApproverGroupAddRemoveMembersRoute,
  ApproverGroupAddLocationsRoute,
} from "ui/routes/approver-groups";
import { ShowErrors, ShowGenericErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { GetApproverGroupHeaderById } from "./graphql/get-approver-group-header-by-id.gen";
import { RemoveApproverGroupByLocation } from "./graphql/remove-location.gen";
import { AddApproverGroupForLocation } from "./graphql/add-location.gen";

type OptionType = {
  label: string;
  value?: string;
}[];

type approverGroup = { name: string; id: string; memberCount: number };

export const ApproverGroupLocationsPage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(ApproverGroupAddLocationsRoute);

  const locations = useLocations(params.organizationId);
  const locationOptions = useMemo(() => {
    const options = locations.reduce(
      (o: any, key: any) => ({ ...o, [key.id]: key.name }),
      {}
    );
    return options;
  }, [locations]);

  const getApproverGroupHeader = useQueryBundle(GetApproverGroupHeaderById, {
    variables: { approverGroupHeaderId: params.approverGroupHeaderId },
  });

  const [createApproverGroup] = useMutationBundle(AddApproverGroupForLocation, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    refetchQueries: ["GetApproverGroupHeaderById"],
  });

  const approverGroupHeader =
    getApproverGroupHeader.state === "LOADING"
      ? undefined
      : getApproverGroupHeader?.data?.approverGroup?.byId;

  if (getApproverGroupHeader.state === "LOADING") {
    return <></>;
  }

  const addApproverGroup = async (approverGroup: ApproverGroupCreateInput) => {
    const result = await createApproverGroup({
      variables: { approverGroup: approverGroup },
    });
    if (!result.data) return false;
    return result.data.approverGroup?.createApproverGroupForLocation?.id;
  };

  const columns: Column<GetApproverGroupHeaderById.ById>[] = [
    {
      title: t("School Name"),
      field: "location.name",
      defaultSort: "asc",
      searchable: true,
      editable: "always",
      lookup: locationOptions,
      render: data =>
        data.location.memberCount === 0 ? (
          <>
            <div className={classes.warning}>{data.location.name}</div>
          </>
        ) : (
          <>
            <div>{data.location.name}</div>
          </>
        ),
    },
    {
      title: t("Members"),
      field: "memberCount",
      searchable: true,
      hidden: isMobile,
      editable: "never",
      render: data =>
        data.memberCount === 0 ? (
          <>
            <div className={classes.warning}>
              {data.memberCount}
              <Tooltip
                title={
                  data.location &&
                  t(
                    "There are no approvers defined for this location. " +
                      "Any workflow step referring to an empty approver location will be skipped."
                  )
                }
              >
                <ErrorIcon className={classes.icon} />
              </Tooltip>
            </div>
          </>
        ) : (
          <>
            <div>{data.memberCount}</div>
          </>
        ),
    },
  ];

  const workflows: OptionType = [];

  return (
    <>
      <div className={classes.headerLink}>
        <Typography variant="h5">{approverGroupHeader?.name}</Typography>
        <div className={classes.linkPadding}>
          <Link
            to={ApproverGroupsRoute.generate({
              organizationId: params.organizationId,
            })}
            className={classes.link}
          >
            {t("Return to Approver Groups")}
          </Link>
        </div>
      </div>
      <PageTitle title={t("Building Approvers")} />
      <Grid container spacing={2} className={classes.content}>
        <Grid item xs={6}>
          <Table
            columns={columns}
            data={locations}
            selection={false}
            onRowClick={async (event, approverGroup) => {
              let approverGroupId = approverGroup?.id;
              if (!approverGroupId) {
                const newApproverGroup: ApproverGroupCreateInput = {
                  orgId: params.organizationId,
                  locationId: location.id,
                  approverGroupHeaderId: params.approverGroupHeaderId,
                };
                approverGroupId = await addApproverGroup(newApproverGroup);
              }
              history.push(
                ApproverGroupAddRemoveMembersRoute.generate({
                  organizationId: params.organizationId,
                  approverGroupId: approverGroupId,
                })
              );
            }}
          />
          <Grid item xs={12}>
            <ViewCard title={t("Referenced by")} values={workflows} />
          </Grid>
        </Grid>
        <Grid item xs={6} />
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  content: {
    marginTop: theme.spacing(2),
  },
  headerLink: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  link: {
    color: theme.customColors.blue,
    "&:visited": {
      color: theme.customColors.blue,
    },
  },
  icon: {
    paddingLeft: "10px",
    fill: theme.customColors.primary,
  },
  warning: {
    fontWeight: 600,
    color: theme.customColors.primary,
  },
  linkPadding: {
    paddingRight: theme.spacing(2),
  },
}));
