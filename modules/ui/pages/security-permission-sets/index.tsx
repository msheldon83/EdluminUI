import { useTranslation } from "react-i18next";
import * as React from "react";
import { useState } from "react";
import { Filters } from "./components/filters";
import { Section } from "ui/components/section";
import { Grid, Button, makeStyles } from "@material-ui/core";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import { PermissionSetUI } from "./ui";
import {
  SecurityPermissionSetsRoute,
  SecurityPermissionSetsAddRoute,
} from "ui/routes/security/permission-sets";
import { OrgUserRole, PermissionEnum } from "graphql/server-types.gen";
import { Link } from "react-router-dom";
import { Can } from "ui/components/auth/can";

type Props = {};

export const SecurityPermissionSets: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [rolesFilter, setRolesFilter] = useState<OrgUserRole[]>([]);
  const [searchText, setSearchText] = useState<string | undefined>();
  const params = useRouteParams(SecurityPermissionSetsRoute);

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        justify="space-between"
        spacing={2}
        className={classes.header}
      >
        <PageTitle title={t("Permission Sets")} />
        <Can do={[PermissionEnum.PermissionSetSave]}>
          <Grid item>
            <Button
              variant="contained"
              component={Link}
              to={SecurityPermissionSetsAddRoute.generate(params)}
            >
              {t("Add Permission Set")}
            </Button>
          </Grid>
        </Can>
      </Grid>
      <Section>
        <Filters
          rolesFilter={rolesFilter}
          setRolesFilter={setRolesFilter}
          setSearchText={setSearchText}
          orgId={params.organizationId}
        />
      </Section>
      <PermissionSetUI rolesFilter={rolesFilter} searchText={searchText} />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(),
  },
}));
