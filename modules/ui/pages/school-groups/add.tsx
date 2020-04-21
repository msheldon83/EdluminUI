import * as React from "react";
import { useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { useQueryBundle } from "graphql/hooks";
import { Typography, makeStyles } from "@material-ui/core";
import { AddLocationGroup } from "./components/add-location-group";
import { useSnackbar } from "hooks/use-snackbar";
import { LocationGroupCreateInput } from "graphql/server-types.gen";
import { ShowErrors } from "ui/components/error-helpers";
import {
  LocationGroupsRoute,
  LocationGroupViewRoute,
} from "ui/routes/location-groups";
import { GetLocationGroupsDocument } from "reference-data/get-location-groups.gen";
import { CreateLocationGroup } from "./graphql/create-location-group.gen";

export const LocationGroupAddPage: React.FC<{}> = props => {
  const history = useHistory();
  const params = useRouteParams(LocationGroupsRoute);
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const [name, setName] = React.useState<string | null>(null);
  const namePlaceholder = t("Glenbrook North High School");

  const [locationGroup, setLocationGroup] = React.useState<
    LocationGroupCreateInput
  >({
    orgId: params.organizationId,
    name: "",
    description: null,
  });

  const locationGroupsReferenceDataQuery = {
    query: GetLocationGroupsDocument,
    varaibles: { orgId: params.organizationId },
  };

  const [createLocationGroup] = useMutationBundle(CreateLocationGroup, {
    refetchQueries: [locationGroupsReferenceDataQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const create = async (locationGroup: LocationGroupCreateInput) => {
    const result = await createLocationGroup({
      variables: {
        locationGroup: {
          ...locationGroup,
          description:
            locationGroup.description &&
            locationGroup.description.trim().length === 0
              ? null
              : locationGroup.description,
        },
      },
    });
    return result?.data?.locationGroup?.create?.id;
  };

  return (
    <AddLocationGroup
      locationGroup={locationGroup}
      onSubmit={async (name: string, description?: string | null) => {
        const newLocationGroup = {
          ...locationGroup,
          name: name,
          description: description,
        };
        setLocationGroup(newLocationGroup);
        const id = await create(newLocationGroup);
        const viewParams = {
          ...params,
          locationGroupId: id!,
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
