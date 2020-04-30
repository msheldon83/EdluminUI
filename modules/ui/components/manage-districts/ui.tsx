import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { Organization, Maybe } from "graphql/server-types.gen";
import { OptionType } from "ui/components/form/select-new";
import { useQueryBundle } from "graphql/hooks";
import { AutoCompleteSearch } from "ui/components/autocomplete-search";
import { SelectedDistrict } from "./components/selected-district";
import { SearchDelegatesToOrganizations } from "./graphql/search-related-orgs.gen";

type Props = {
  relatedOrgs: Maybe<Pick<Organization, "id" | "name" | "orgId">>[];
  orgId: string;
  allDistrictAttributes: string[];
  onAddOrg: (orgId: string) => Promise<unknown>;
  onRemoveOrg: (orgId: string) => Promise<unknown>;
  onAddAttribute: (attributeId: string) => Promise<unknown>;
  onRemoveAttribute: (orgId: string) => Promise<unknown>;
  isAdmin?: boolean;
};

export const ManageDistrictsUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState<string | undefined>();

  const {
    relatedOrgs,
    allDistrictAttributes,
    isAdmin,
    onAddOrg,
    onRemoveOrg,
    onAddAttribute,
    onRemoveAttribute,
  } = props;

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
      <Grid item xs={12} md={6} lg={6}>
        <Section>
          <SectionHeader title={t("Add a district")} />
          <AutoCompleteSearch
            onClick={onAddOrg}
            searchText={searchText}
            setSearchText={setSearchText}
            options={districtOptions}
            placeholder={"District name"}
          />
        </Section>
      </Grid>
      {isAdmin && (
        <Grid item xs={12} md={6} lg={6}>
          <Section>
            <SectionHeader title={t("All district attributes")} />
            {allDistrictAttributes.length === 0 ? (
              <div>{t("No district attributes")}</div>
            ) : (
              allDistrictAttributes?.map((n, i) => <div key={i}>{n}</div>)
            )}
          </Section>
        </Grid>
      )}
      <Grid item xs={12}>
        <SelectedDistrict
          relatedOrgs={relatedOrgs}
          onRemoveOrg={onRemoveOrg}
          onAddAttribute={onAddAttribute}
          onRemoveAttribute={onRemoveAttribute}
        />
      </Grid>
    </Grid>
  );
};
