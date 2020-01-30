import { Button, Grid, makeStyles } from "@material-ui/core";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useIsMobile } from "hooks";
import { compact } from "lodash-es";
import { Column } from "material-table";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { PageTitle } from "ui/components/page-title";
import { Table } from "ui/components/table";
import { GetAllPositionTypesWithinOrg } from "ui/pages/position-type/graphql/position-types.gen";
import { useRouteParams } from "ui/routes/definition";
import {
  PositionTypeAddRoute,
  PositionTypeRoute,
  PositionTypeViewRoute,
} from "ui/routes/position-type";
import { DeletePostionType } from "./graphql/DeletePositionType.gen";
import { PermissionEnum } from "graphql/server-types.gen";
import { Can } from "ui/components/auth/can";

export const PositionTypePage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PositionTypeRoute);
  const isMobile = useIsMobile();
  const [includeExpired, setIncludeExpired] = React.useState(false);

  const getPositionTypes = useQueryBundle(GetAllPositionTypesWithinOrg, {
    variables: { orgId: params.organizationId, includeExpired },
  });
  const [deletePositionTypeMutation] = useMutationBundle(DeletePostionType);
  const deletePositionType = (positionTypeId: string) => {
    return deletePositionTypeMutation({
      variables: {
        positionTypeId: positionTypeId,
      },
    });
  };

  const deleteSelected = async (data: { id: string } | { id: string }[]) => {
    if (Array.isArray(data)) {
      await Promise.all(data.map(id => deletePositionType(id.id)));
    } else {
      await Promise.resolve(deletePositionType(data.id));
    }
    await getPositionTypes.refetch();
  };

  const columns: Column<GetAllPositionTypesWithinOrg.All>[] = [
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
      title: t("Use for Employees"),
      field: "forPermanentPositions",
      type: "boolean",
      searchable: false,
      hidden: isMobile,
    },
    {
      title: t("Use for Vacancies"),
      field: "forStaffAugmentation",
      type: "boolean",
      searchable: false,
      hidden: isMobile,
    },
    {
      title: t("Default Contract Name"),
      field: "defaultContract.name",
      searchable: false,
      hidden: isMobile,
    },
  ];

  if (getPositionTypes.state === "LOADING") {
    return <></>;
  }

  const positionTypes = compact(
    getPositionTypes?.data?.positionType?.all ?? []
  );
  const positionTypesCount = positionTypes.length;

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
          <PageTitle title={t("Position Types")} />
        </Grid>
        <Can do={[PermissionEnum.FinanceSettingsSave]}>
          <Grid item>
            <Button
              variant="contained"
              component={Link}
              to={PositionTypeAddRoute.generate(params)}
            >
              {t("Add Position Type")}
            </Button>
          </Grid>
        </Can>
      </Grid>
      <Table
        title={`${positionTypesCount} ${t("Position Types")}`}
        columns={columns}
        data={positionTypes}
        selection={false}
        onRowClick={(event, positionType) => {
          if (!positionType) return;
          const newParams = {
            ...params,
            positionTypeId: positionType.id,
          };
          history.push(PositionTypeViewRoute.generate(newParams));
        }}
        options={{
          search: false,
        }}
        showIncludeExpired={true}
        onIncludeExpiredChange={checked => {
          setIncludeExpired(checked);
        }}
        expiredRowCheck={(rowData: GetAllPositionTypesWithinOrg.All) =>
          rowData.expired
        }
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(),
  },
}));
