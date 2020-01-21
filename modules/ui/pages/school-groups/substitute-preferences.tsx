import * as React from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetLocationGroupById } from "./graphql/get-location-groups-by-id.gen";
import { UpdateLocationGroup } from "./graphql/update-location-group.gen";
import { useRouteParams } from "ui/routes/definition";
import { LocationGroupSubPrefRoute } from "ui/routes/location-groups";
import { useTranslation } from "react-i18next";
import { SubPoolCard } from "ui/components/sub-pools/subpoolcard";
import { SubstitutePicker } from "ui/components/sub-pools/substitute-picker";
import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { ShowErrors, ShowGenericErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";

export const LocationGroupSubstitutePreferencePage: React.FC<{}> = props => {
  const params = useRouteParams(LocationGroupSubPrefRoute);
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const getLocationGroup = useQueryBundle(GetLocationGroupById, {
    variables: {
      locationGroupId: params.locationGroupId,
    },
    fetchPolicy: "cache-first",
  });

  const onRemoveFavoriteSubstitute = async (substitute: any) => {
    const filteredFavorites = locationGroup.substitutePreferences?.favoriteSubstitutes.filter(
      (u: any) => {
        return u.id !== substitute.id;
      }
    );
    return updatePreferences(
      filteredFavorites,
      locationGroup.substitutePreferences?.blockedSubstitutes
    );
  };

  const onRemoveBlockedSubstitute = async (substitute: any) => {
    const filteredBlocked = locationGroup.substitutePreferences?.blockedSubstitutes.filter(
      (u: any) => {
        return u.id !== substitute.id;
      }
    );
    return updatePreferences(
      locationGroup.substitutePreferences?.favoriteSubstitutes,
      filteredBlocked
    );
  };

  const onAddSubstitute = async (substitute: any) => {
    locationGroup.substitutePreferences?.favoriteSubstitutes.push(substitute);

    return updatePreferences(
      locationGroup.substitutePreferences?.favoriteSubstitutes,
      locationGroup.substitutePreferences?.blockedSubstitutes
    );
  };

  const onBlockSubstitute = async (substitute: any) => {
    locationGroup.substitutePreferences?.blockedSubstitutes.push(substitute);

    return updatePreferences(
      locationGroup.substitutePreferences?.favoriteSubstitutes,
      locationGroup.substitutePreferences?.blockedSubstitutes
    );
  };

  const updatePreferences = async (favorites: any[], blocked: any[]) => {
    const neweFavs = favorites.map((s: any) => {
      return { id: s.id };
    });

    const neweBlocked = blocked.map((s: any) => {
      return { id: s.id };
    });
    const updatedLocationGroup: any = {
      id: locationGroup.id,
      rowVersion: locationGroup.rowVersion,
      substitutePreferences: {
        favoriteSubstitutes: neweFavs,
        blockedSubstitutes: neweBlocked,
      },
    };
    const result = await updateLocationGroup({
      variables: {
        locationGroup: updatedLocationGroup,
      },
    });
    if (result === undefined) return false;
    await getLocationGroup.refetch();
    return true;
  };

  const [updateLocationGroup] = useMutationBundle(UpdateLocationGroup, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  if (getLocationGroup.state === "LOADING") {
    return <></>;
  }
  const locationGroup: any =
    getLocationGroup?.data?.locationGroup?.byId ?? undefined;
  return (
    <>
      <Typography variant="h5">{locationGroup.name}</Typography>
      <Typography variant="h1">{t("Substitute Preferences")}</Typography>
      <Grid container spacing={2} className={classes.content}>
        <Grid item md={6} xs={12}>
          <SubPoolCard
            title={t("Favorite Substitutes")}
            blocked={false}
            orgUsers={locationGroup.substitutePreferences.favoriteSubstitutes}
            onRemove={onRemoveFavoriteSubstitute}
          ></SubPoolCard>
        </Grid>
        <Grid item md={6} xs={12}>
          <SubPoolCard
            title={t("Blocked Substitutes")}
            blocked={true}
            orgUsers={locationGroup.substitutePreferences.blockedSubstitutes}
            onRemove={onRemoveBlockedSubstitute}
          ></SubPoolCard>
        </Grid>
        <Grid item xs={12}>
          <SubstitutePicker
            orgId={params.organizationId}
            title={"All Substitutes"}
            locationId={locationGroup.id}
            onAdd={onAddSubstitute}
            onBlock={onBlockSubstitute}
            takenSubstitutes={locationGroup.substitutePreferences.favoriteSubstitutes.concat(
              locationGroup.substitutePreferences.blockedSubstitutes
            )}
          ></SubstitutePicker>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  content: {
    marginTop: theme.spacing(2),
  },
}));
