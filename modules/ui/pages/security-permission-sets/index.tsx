import { useTheme } from "@material-ui/styles";
import {
  Button,
  Grid,
  makeStyles,
  InputLabel,
  TextField,
} from "@material-ui/core";
import * as React from "react";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { Table } from "ui/components/table";
import { Column } from "material-table";
import { useHistory } from "react-router";
import { Input } from "ui/components/form/input";
import { compact } from "lodash-es";
import { Section } from "ui/components/section";
import { PageTitle } from "ui/components/page-title";
import { SecurityPermissionSetsRoute } from "ui/routes/security/permission-sets";
import { useRouteParams } from "ui/routes/definition";
import { useQueryParams } from "hooks/query-params";
import { GetAllPermissionSetsWithinOrg } from "./graphql/get-all-permission-sets.gen";
import { useDeferredState, useIsMobile } from "hooks";
import { useCallback, useEffect, useMemo } from "react";
import { DeletePermissionSet } from "./graphql/delete-permission-set.gen";

type Props = {};

export const SecurityPermissionSets: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(SecurityPermissionSetsRoute);
  const [includeExpired, setIncludeExpired] = React.useState(false);

  const [filters, updateFilters] = useQueryParams({ name: "" });
  const [name, pendingName, setPendingName] = useDeferredState(
    filters.name,
    200
  );
  useEffect(() => {
    if (name !== filters.name) {
      setPendingName(name);
    }
  }, [filters.name]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (name !== filters.name) {
      updateFilters({ name });
    }
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  const getPermissionSets = useQueryBundle(GetAllPermissionSetsWithinOrg, {
    variables: { orgId: params.organizationId },
  });
  const [deletePermissionSetMutation] = useMutationBundle(DeletePermissionSet);
  const deletePermissionSet = (permissionSetId: string) => {
    return deletePermissionSetMutation({
      variables: {
        permissionSetId: Number(permissionSetId),
      },
    });
  };

  //TODO: Wire up check boxes for multi-select. Check with Mike if multi-select is needed when there is no pagination.
  const deleteSelected = async (data: { id: string } | { id: string }[]) => {
    if (Array.isArray(data)) {
      await Promise.all(data.map(id => deletePermissionSet(id.id)));
    } else {
      await Promise.resolve(deletePermissionSet(data.id));
    }
    await getPermissionSets.refetch();
  };

  const columns: Column<GetAllPermissionSetsWithinOrg.All>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
    },
    {
      title: t("Role"),
      field: "orgUserRole",
      type: "string",
      searchable: false,
      hidden: isMobile,
    },
    {
      title: t("Description"),
      field: "description",
      searchable: false,
      hidden: isMobile,
    },
  ];

  if (getPermissionSets.state === "LOADING") {
    return <></>;
  }

  const permissionSets = compact(
    getPermissionSets?.data?.permissionSet?.all ?? []
  );
  const permissionSetsCount = permissionSets.length;
  console.log(permissionSets);

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
          <PageTitle title={t("Permission Sets")} />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            //component={Link}
            //to={PositionTypeAddRoute.generate(params)} Generate correct Route for ADD
          >
            {t("Add Position Type")}
          </Button>
        </Grid>
      </Grid>
      <Grid item xs={12} md={3}>
        <InputLabel className={classes.label}>{t("Name")}</InputLabel>
        <TextField
          className={classes.textField}
          variant="outlined"
          name={"name"}
          value={pendingName ?? ""}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            if (!event.target.value || !event.target.value.length) {
              setPendingName(undefined);
            } else {
              setPendingName(event.target.value);
            }
          }}
          placeholder={t("Search for first or last name")}
          fullWidth
        />
      </Grid>
      <Table
        title={`${permissionSetsCount} ${t("Permission Sets")}`}
        columns={columns}
        data={permissionSets}
        selection={false}
        onRowClick={(event, permissionSet) => {
          if (!permissionSet) return;
          const newParams = {
            ...params,
            permissionSet: permissionSet.id,
          };
          //history.push(PositionTypeViewRoute.generate(newParams)); TODO: Create Route for Permission Set View
        }}
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
  nameFieldContainer: {
    width: theme.typography.pxToRem(262),
  },
  label: {
    // color: theme.customColors.black,
    fontWeight: 500,
  },
  textField: {
    marginTop: theme.spacing(2),
  },
}));
