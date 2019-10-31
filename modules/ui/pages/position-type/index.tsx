import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { GetAllPositionTypesWithinOrg } from "ui/pages/position-type/graphql/position-types.gen";
import * as React from "react";
import { Table } from "ui/components/table";
import { PageTitle } from "ui/components/page-title";
import {
  PositionTypeViewRoute,
  PositionTypeRoute,
  PositionTypeAddRoute,
} from "ui/routes/position-type";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { Link } from "react-router-dom";
import { makeStyles, Grid, Button } from "@material-ui/core";
import { compact } from "lodash-es";
import { useScreenSize } from "hooks";
import { Column } from "material-table";
import { DeletePostionType } from "./graphql/DeletePositionType.gen";
import DeleteOutline from "@material-ui/icons/DeleteOutline";

export const PositionTypePage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PositionTypeRoute);
  const isMobile = useScreenSize() === "mobile";
  const [includeExpired, setIncludeExpired] = React.useState(false);
  
  const getPositionTypes = useQueryBundle(GetAllPositionTypesWithinOrg, {
    variables: { orgId: params.organizationId, includeExpired },
  });
  const [deletePositionTypeMutation] = useMutationBundle(DeletePostionType);
  const deletePositionType = (positionTypeId: string) => {
    return deletePositionTypeMutation({
      variables: {
        positionTypeId: Number(positionTypeId),
      },
    });
  };

  const deleteSelected = async (data: {id: string} | {id: string}[]) => {
    if (Array.isArray(data)) {
      await Promise.all(data.map(id => deletePositionType(id.id)));
    } else {
      await Promise.resolve(deletePositionType(data.id));
    }    
    getPositionTypes.refetch();
  };

  const columns: Column<GetAllPositionTypesWithinOrg.All>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true
    },
    { title: t("External Id"), field: "externalId", searchable: true, hidden:isMobile },
    {
      title: t("Use for Employees"),
      field: "forPermanentPositions",
      type: "boolean",
      searchable: false,
      hidden:isMobile
    },
    {
      title: t("Use for Vacancies"),
      field: "forStaffAugmentation",
      type: "boolean",
      searchable: false,
      hidden:isMobile
    },
    {
      title: t("Default Contract Name"),
      field: "defaultContract.name",
      searchable: false,
      hidden:isMobile
    }
  ];

  if (getPositionTypes.state === "LOADING") {
    return <></>;
  }

  const positionTypes = compact(getPositionTypes?.data?.positionType?.all ?? []);
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
        <Grid item>
          <Button
            variant="contained"
            component={Link}
            to={PositionTypeAddRoute.generate(params)}
          >
            {t("Add Position Type")}
          </Button>
        </Grid>
      </Grid>
      <Table
        title={`${positionTypesCount} ${t("Position Types")}`}
        columns={columns}
        data={positionTypes}
        selection={!isMobile}
        onRowClick={(event, positionType) => {
          if (!positionType) return;
          const newParams = {
            ...params,
            positionTypeId: positionType.id,
          };
          history.push(PositionTypeViewRoute.generate(newParams));
        }}
        options={{
          search: true
        }}
        showIncludeExpired={true}
        onIncludeExpiredChange={(checked) => { setIncludeExpired(checked);}}
        expiredRowCheck={(rowData: GetAllPositionTypesWithinOrg.All) => rowData.expired}
        actions={[
          {
            tooltip: `${t("Delete selected position types")}`,
            icon: () => <DeleteOutline />, /* eslint-disable-line */ // This should be able to be "delete" as a string which will use the table delete icon, but that didn't work for some reason
            onClick: (event, data) => {
              deleteSelected(data);
            },
          },
        ]}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing()
  }
}));