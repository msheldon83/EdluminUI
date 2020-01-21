import * as React from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetLocationById } from "./graphql/get-location-by-id.gen";
import { UpdateLocation } from "./graphql/update-location.gen";
import { useRouteParams } from "ui/routes/definition";
import { LocationsSubPrefRoute } from "ui/routes/locations";
import { useTranslation } from "react-i18next";
import { SubPoolCard } from "ui/components/sub-pools/subpoolcard";
import { SubstitutePicker } from "ui/components/sub-pools/substitute-picker";
import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { ShowErrors, ShowGenericErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { LocationUpdateInput } from "graphql/server-types.gen";

export const LocationsSubstitutePreferencePage: React.FC<{}> = props => {
  const params = useRouteParams(LocationsSubPrefRoute);
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const getLocation = useQueryBundle(GetLocationById, {
    variables: {
      locationId: params.locationId,
    },
    fetchPolicy: "cache-first",
  });

  const onRemoveFavoriteSubstitute = async (substitute: any) => {
    const filteredFavorites = location.substitutePreferences?.favoriteSubstitutes.filter(
      (u: any) => {
        return u.id !== substitute.id;
      }
    );
    return updatePreferences(
      filteredFavorites,
      location.substitutePreferences?.blockedSubstitutes
    );
  };

  const onRemoveBlockedSubstitute = async (substitute: any) => {
    const filteredBlocked = location.substitutePreferences?.blockedSubstitutes.filter(
      (u: any) => {
        return u.id !== substitute.id;
      }
    );
    return updatePreferences(
      location.substitutePreferences?.favoriteSubstitutes,
      filteredBlocked
    );
  };

  const onAddSubstitute = async (substitute: any) => {
    location.substitutePreferences?.favoriteSubstitutes.push(substitute);

    return updatePreferences(
      location.substitutePreferences?.favoriteSubstitutes,
      location.substitutePreferences?.blockedSubstitutes
    );
  };

  const onBlockSubstitute = async (substitute: any) => {
    location.substitutePreferences?.blockedSubstitutes.push(substitute);

    return updatePreferences(
      location.substitutePreferences?.favoriteSubstitutes,
      location.substitutePreferences?.blockedSubstitutes
    );
  };

  const updatePreferences = async (favorites: any[], blocked: any[]) => {
    const neweFavs = favorites.map((s: any) => {
      return { id: s.id };
    });

    const neweBlocked = blocked.map((s: any) => {
      return { id: s.id };
    });
    const updatedLocation: any = {
      id: location.id,
      rowVersion: location.rowVersion,
      substitutePreferences: {
        favoriteSubstitutes: neweFavs,
        blockedSubstitutes: neweBlocked,
      },
    };
    const result = await updateLocation({
      variables: {
        location: updatedLocation,
      },
    });
    if (result === undefined) return false;
    await getLocation.refetch();
    return true;
  };

  const [updateLocation] = useMutationBundle(UpdateLocation, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  if (getLocation.state === "LOADING") {
    return <></>;
  }
  const location: any = getLocation?.data?.location?.byId ?? undefined;
  return (
    <>
      <Typography variant="h5">{location.name}</Typography>
      <Typography variant="h1">{t("Substitute Preferences")}</Typography>
      <Grid container spacing={2} className={classes.content}>
        <Grid item md={6} xs={12}>
          <SubPoolCard
            title={t("Favorite Substitutes")}
            blocked={false}
            orgUsers={location.substitutePreferences.favoriteSubstitutes}
            onRemove={onRemoveFavoriteSubstitute}
          ></SubPoolCard>
        </Grid>
        <Grid item md={6} xs={12}>
          <SubPoolCard
            title={t("Blocked Substitutes")}
            blocked={true}
            orgUsers={location.substitutePreferences.blockedSubstitutes}
            onRemove={onRemoveBlockedSubstitute}
          ></SubPoolCard>
        </Grid>
        <Grid item xs={12}>
          <SubstitutePicker
            orgId={params.organizationId}
            title={"All Substitutes"}
            locationId={location.id}
            onAdd={onAddSubstitute}
            onBlock={onBlockSubstitute}
            takenSubstitutes={location.substitutePreferences.favoriteSubstitutes.concat(
              location.substitutePreferences.blockedSubstitutes
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
