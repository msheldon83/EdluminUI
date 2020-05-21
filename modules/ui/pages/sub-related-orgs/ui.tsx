import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { SelectNew } from "ui/components/form/select-new";
import { CustomOrgUserRelationship } from "./helpers";
import { OptionType } from "ui/components/form/select-new";
import { useQueryBundle } from "graphql/hooks";
import { SubstituteInput } from "graphql/server-types.gen";
import { AutoCompleteSearch } from "ui/components/autocomplete-search";
import { SelectedDistricts } from "./components/selected-districts";
import { GetDelegatesToOrganizations } from "./graphql/get-delegate-orgs.gen";

type Props = {
  orgUserRelationships: CustomOrgUserRelationship[];
  orgId: string;
  orgEndorsements: OptionType[];
  onAddOrg: (orgId: string) => Promise<unknown>;
  onRemoveOrg: (orgId: string) => Promise<unknown>;
  onSave: (sub: SubstituteInput) => Promise<any>;
  allDistrictAttributes?: string[];
};

export const ManageDistrictsUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [searchText, setSearchText] = useState<string | undefined>();

  const {
    allDistrictAttributes,
    onAddOrg,
    onRemoveOrg,
    orgUserRelationships,
    orgEndorsements,
    onSave,
  } = props;

  const sortedDistrictAttributes = allDistrictAttributes?.sort((a, b) =>
    a?.toLowerCase() > b?.toLowerCase() ? 1 : -1
  );

  const getDistricts = useQueryBundle(GetDelegatesToOrganizations, {
    variables: {
      orgId: props.orgId,
    },
  });

  const districts =
    getDistricts.state != "LOADING"
      ? getDistricts.data.organization?.delegatesToOrganizations ?? []
      : [];

  const districtOptions: OptionType[] = useMemo(
    () =>
      districts.map(p => ({
        label: p?.name ?? "",
        value: p?.id ?? "",
      })),
    [districts]
  );

  const sortedDistrictOptions = districtOptions?.sort((a, b) =>
    a?.label?.toLowerCase() > b?.label?.toLowerCase() ? 1 : -1
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6} lg={6}>
        <Section>
          <SectionHeader title={t("Add a district")} />
          <Grid item xs={12} container className={classes.spacing}>
            {t("Search")}
          </Grid>
          <AutoCompleteSearch
            onClick={onAddOrg}
            searchText={searchText}
            setSearchText={setSearchText}
            options={sortedDistrictOptions}
            placeholder={"District name"}
          />
        </Section>
      </Grid>
      {sortedDistrictAttributes && (
        <Grid item xs={12} md={6} lg={6}>
          <Section>
            <SectionHeader title={t("All district attributes")} />
            {sortedDistrictAttributes?.length === 0 ? (
              <div>{t("No district attributes")}</div>
            ) : (
              sortedDistrictAttributes?.map((n, i) => <div key={i}>{n}</div>)
            )}
          </Section>
        </Grid>
      )}
      <Grid item xs={12}>
        <SelectedDistricts
          orgUserRelationships={orgUserRelationships}
          orgEndorsements={orgEndorsements}
          onRemoveOrg={onRemoveOrg}
          onSave={onSave}
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
