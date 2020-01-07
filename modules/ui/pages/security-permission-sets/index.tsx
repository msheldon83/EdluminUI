import { useTranslation } from "react-i18next";
import * as React from "react";
import { useState } from "react";
import { Filters } from "./components/filters";
import { Section } from "ui/components/section";
import { Grid, Button, makeStyles } from "@material-ui/core";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import { PermissionSetUI } from "./ui";
import { SecurityPermissionSetsRoute } from "ui/routes/security/permission-sets";
import { OrgUserRole } from "graphql/server-types.gen";

type Props = {};

export const SecurityPermissionSets: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [rolesFilter, setRolesFilter] = useState<OrgUserRole[]>([]);
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
        <Grid item>
          <Button
            variant="contained"
            //component={Link}
            //to={PositionTypeAddRoute.generate(params)} Generate correct Route for ADD
          >
            {t("Add Permission Set")}
          </Button>
        </Grid>
      </Grid>
      <Section>
        <Filters
          rolesFilter={rolesFilter}
          setRolesFilter={setRolesFilter}
          orgId={params.organizationId}
        />
      </Section>
      <PermissionSetUI rolesFilter={rolesFilter} />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(),
  },
}));
