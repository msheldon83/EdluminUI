import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { CustomOrgUserRelationship } from "./helpers";
import { OptionType } from "ui/components/form/select-new";
import { useQueryBundle } from "graphql/hooks";
import { SubstituteInput } from "graphql/server-types.gen";
import { AutoCompleteSearch } from "ui/components/autocomplete-search";
import { SelectedDistricts } from "./components/selected-districts";
import { SearchDelegatesToOrganizations } from "./graphql/search-related-orgs.gen";

type Props = {
  orgUserRelationships: CustomOrgUserRelationship[];
  orgId: string;
  onAddOrg: (orgId: string) => Promise<unknown>;
  onRemoveOrg: (orgId: string) => Promise<unknown>;
};

export const ManageDistrictsUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [searchText, setSearchText] = useState<string | undefined>();

  const { onAddOrg, onRemoveOrg, orgUserRelationships } = props;

  const getDistricts = useQueryBundle(SearchDelegatesToOrganizations, {
    variables: {
      orgId: props.orgId,
      searchText: searchText,
    },
    skip: searchText === undefined,
  });

  const districts =
    getDistricts.state != "LOADING"
      ? getDistricts.data.organization?.searchDelegatesToOrganizations ?? []
      : [];

  const districtOptions: OptionType[] = useMemo(
    () =>
      districts.map(p => ({
        label: p?.name ?? "",
        value: p?.id ?? "",
      })),
    [districts]
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Section>
          <SectionHeader title={t("Add a district")} />
          <Grid item xs={12} container className={classes.spacing}>
            {t("Search")}
          </Grid>
          <AutoCompleteSearch
            onClick={onAddOrg}
            searchText={searchText}
            setSearchText={setSearchText}
            options={districtOptions}
            placeholder={"District name"}
          />
        </Section>
      </Grid>

      <Grid item xs={12}>
        <SelectedDistricts
          orgUserRelationships={orgUserRelationships}
          onRemoveOrg={onRemoveOrg}
        />
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  spacing: {
    paddingTop: theme.spacing(1),
  },
}));
