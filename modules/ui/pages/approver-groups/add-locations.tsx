import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { Grid, Typography, Tooltip } from "@material-ui/core";
import {
  ApproverGroupCreateInput,
  PermissionEnum,
} from "graphql/server-types.gen";
import { WorkflowViewCard } from "./components/workflow-view-card";
import { useIsMobile } from "hooks";
import { useRouteParams } from "ui/routes/definition";
import ErrorIcon from "@material-ui/icons/Error";
import { Table } from "ui/components/table";
import { Section } from "ui/components/section";
import { Link } from "react-router-dom";
import { useCanDo } from "ui/components/auth/can";
import { Column } from "material-table";
import { compact } from "lodash-es";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ApproverGroupsRoute,
  ApproverGroupAddRemoveMembersRoute,
  ApproverGroupAddLocationsRoute,
} from "ui/routes/approver-groups";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { GetApproverGroupHeaderById } from "./graphql/get-approver-group-header-by-id.gen";
import { AddApproverGroupForLocation } from "./graphql/add-location.gen";
import { GetAllLocations } from "./graphql/get-all-locations.gen";
import { NameHeader } from "./components/name-header";

export const ApproverGroupLocationsPage: React.FC<{}> = props => {
  const classes = useStyles();
  const canDoFn = useCanDo();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(ApproverGroupAddLocationsRoute);

  const getAllLocations = useQueryBundle(GetAllLocations, {
    variables: {
      approverGroupHeaderId: params.approverGroupHeaderId,
      orgId: params.organizationId,
    },
  });

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

  const locations =
    (getAllLocations.state === "LOADING"
      ? undefined
      : compact(getAllLocations.data.location?.all)) ?? [];

  if (
    getApproverGroupHeader.state === "LOADING" ||
    getAllLocations.state === "LOADING"
  ) {
    return <></>;
  }

  const addApproverGroup = async (approverGroup: ApproverGroupCreateInput) => {
    const result = await createApproverGroup({
      variables: { approverGroup: approverGroup },
    });
    if (!result.data) return false;
    return result.data.approverGroup?.createApproverGroupForLocation?.id;
  };

  const columns: Column<GetAllLocations.All>[] = [
    {
      title: t("School Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
      render: data =>
        data.approverGroupByHeaderId?.memberCount === 0 ||
        !data.approverGroupByHeaderId ? (
          <>
            <div className={classes.warning}>{data.name}</div>
          </>
        ) : (
          <>
            <div>{data.name}</div>
          </>
        ),
    },
    {
      title: t("Members"),
      field: "approverGroupByHeaderId?.memberCount",
      searchable: true,
      hidden: isMobile,
      render: data =>
        data.approverGroupByHeaderId?.memberCount === 0 ||
        !data.approverGroupByHeaderId ? (
          <>
            <div className={classes.warning}>
              {data.approverGroupByHeaderId?.memberCount ?? t("0")}
              <Tooltip
                title={t(
                  "There are no approvers defined for this location. " +
                    "Any workflow step referring to an empty approver location will be skipped."
                )}
              >
                <ErrorIcon className={classes.icon} />
              </Tooltip>
            </div>
          </>
        ) : (
          <>
            <div>{data.approverGroupByHeaderId?.memberCount}</div>
          </>
        ),
    },
  ];

  const approvalWorkflows = compact(
    approverGroupHeader?.approvalWorkflows?.map(e => {
      return { value: e?.id, label: e?.name ?? "" };
    })
  );

  const canAddLocationGroup = canDoFn([PermissionEnum.ApprovalSettingsSave]);

  return (
    <>
      <div className={classes.headerLink}>
        <Typography variant="h5">{t("Approver Group")}</Typography>
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
      {approverGroupHeader && (
        <NameHeader
          approverGroupHeaderId={approverGroupHeader.id}
          name={approverGroupHeader.name}
          identifier={approverGroupHeader.externalId}
          rowVersion={approverGroupHeader.rowVersion}
        />
      )}
      <Grid container className={classes.content}>
        <Grid item xs={6}>
          <Section>
            <Table
              columns={columns}
              data={locations}
              selection={false}
              onRowClick={async (event, location) => {
                let approverGroupId = location?.approverGroupByHeaderId?.id
                  ? location?.approverGroupByHeaderId?.id
                  : undefined;

                if (!approverGroupId && canAddLocationGroup) {
                  const newApproverGroup: ApproverGroupCreateInput = {
                    orgId: params.organizationId,
                    locationId: location!.id,
                    approverGroupHeaderId: params.approverGroupHeaderId,
                  };
                  const result = await addApproverGroup(newApproverGroup);
                  approverGroupId = result ? result : undefined;
                }

                if (approverGroupId) {
                  history.push(
                    ApproverGroupAddRemoveMembersRoute.generate({
                      organizationId: params.organizationId,
                      approverGroupId: approverGroupId,
                    })
                  );
                }
              }}
            />
          </Section>
          <Grid item xs={12}>
            <WorkflowViewCard
              title={t("Referenced by")}
              values={approvalWorkflows}
            />
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
    paddingLeft: theme.spacing(1),
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
