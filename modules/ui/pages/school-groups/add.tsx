import * as React from "react";
import { useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { makeStyles, Typography } from "@material-ui/core";
import { AddLocationGroup } from "./components/add-location-group";
import { useSnackbar } from "hooks/use-snackbar";
import { LocationGroupCreateInput } from "graphql/server-types.gen";
import { ShowErrors } from "ui/components/error-helpers";
import {
  LocationGroupsRoute,
  LocationGroupAddRoute,
  LocationGroupViewRoute,
} from "ui/routes/location-groups";
import { CreateLocationGroup } from "./graphql/create-location-group.gen";

export const LocationGroupAddPage: React.FC<{}> = props => {
  const history = useHistory();
  const params = useRouteParams(LocationGroupAddRoute);
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const classes = useStyles();
  const [name, setName] = React.useState<string | null>(null);
  const namePlaceholder = t("Middle School");

  const [locationGroup, setLocationGroup] = React.useState<
    LocationGroupCreateInput
  >({
    orgId: params.organizationId,
    name: "",
    externalId: null,
  });

  const [createLocationGroup] = useMutationBundle(CreateLocationGroup, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const create = async (locationGroup: LocationGroupCreateInput) => {
    const result = await createLocationGroup({
      variables: {
        locationGroup: {
          ...locationGroup,
          name: locationGroup.name,
          externalId:
            locationGroup.externalId &&
            locationGroup.externalId.trim().length === 0
              ? null
              : locationGroup.externalId,
        },
      },
    });

    return result?.data?.locationGroup?.create;
  };

  return (
    <>
      <div className={classes.header}>
        <PageTitle title={t("Create new school group")} />
        <Typography variant="h1">
          {name || (
            <span className={classes.placeholder}>{namePlaceholder}</span>
          )}
        </Typography>
      </div>

      <AddLocationGroup
        locationGroup={locationGroup}
        onSubmit={async (locationGroup: LocationGroupCreateInput) => {
          const newLocationGroup = {
            ...locationGroup,
            name: locationGroup.name,
            externalId: locationGroup.externalId,
          };
          setLocationGroup(newLocationGroup);
          const result = await create(newLocationGroup);
          const viewParams = {
            organizationId: result!.orgId,
            locationGroupId: result!.id,
          };
          history.push(LocationGroupViewRoute.generate(viewParams));
        }}
        onCancel={() => {
          const url = LocationGroupsRoute.generate(params);
          history.push(url);
        }}
        onNameChange={name => setName(name)}
        namePlaceholder={namePlaceholder}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  placeholder: {
    opacity: "0.2",
    filter: "alpha(opacity = 20)",
  },
}));
