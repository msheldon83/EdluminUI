import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles } from "@material-ui/core";
import { Input } from "ui/components/form/input";
import { useCallback, useEffect } from "react";
import { useDeferredState } from "hooks";
import { LocationGroupSelect } from "ui/components/reference-selects/location-group-select";

type Props = {
  orgId: string;
  locationGroupFilter: string[];
  setSearchText: React.Dispatch<React.SetStateAction<string | undefined>>;
  setLocationGroupsFilter: React.Dispatch<React.SetStateAction<string[]>>;
};

export const Filters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { orgId, locationGroupFilter, setLocationGroupsFilter } = props;

  const setSearchText = props.setSearchText;

  const [
    searchText,
    pendingSearchText,
    setPendingSearchText,
  ] = useDeferredState<string | undefined>(undefined, 200);
  useEffect(() => {
    setSearchText(searchText);
  }, [setSearchText, searchText]);

  const updateSearchText = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingSearchText(event.target.value);
    },
    [setPendingSearchText]
  );

  const onChangeGroup = useCallback(
    (locationGroupId?: string) => {
      if (locationGroupId === "0") {
        setLocationGroupsFilter([]);
      } else {
        setLocationGroupsFilter([locationGroupId ?? ""]);
      }
    },
    [setLocationGroupsFilter]
  );

  return (
    <>
      <Grid container alignItems="center" justify="flex-start" spacing={2}>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <Input
            label={t("Name or ID")}
            value={pendingSearchText}
            onChange={updateSearchText}
            placeholder={t("Filter by name or ID")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <LocationGroupSelect
            orgId={orgId}
            label={t("Group")}
            selectedLocationGroupId={locationGroupFilter[0]}
            setSelectedLocationGroupId={onChangeGroup}
          />
        </Grid>
      </Grid>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
