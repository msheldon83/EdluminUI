import * as React from "react";
import { Divider, Grid, makeStyles } from "@material-ui/core";
import { useMemo } from "react";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { GetRelatedOrgs } from "./graphql/get-related-orgs.gen";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { OptionType } from "ui/components/form/select-new";
import { useQueryBundle } from "graphql/hooks";
import { AutoCompleteSearch } from "ui/components/autocomplete-search";
import { SearchDelegatesToOrganizations } from "./graphql/search-related-orgs.gen";

type Props = {
  relatedOrgIds: Array<string | null | undefined> | null | undefined;
  orgId: string;
  allDistrictAttributes: string[];
  onAdd: (orgId: string) => Promise<unknown>;
  onRemove: (orgId: string) => Promise<unknown>;
  isAdmin?: boolean;
};

export const ManageDistrictsUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [searchText, setSearchText] = useState<string | undefined>();

  //Search for District Query
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

  const getRelatedOrgs = useQueryBundle(GetRelatedOrgs, {
    variables: {
      orgId: props.orgId,
    },
  });
  const organizations =
    getRelatedOrgs.state === "LOADING"
      ? []
      : getRelatedOrgs?.data?.organizationRelationship?.all ?? [];
  const relatedOrgs = useMemo(
    () =>
      organizations.map(x => ({
        id: x?.organization.id,
        name: x?.organization.name,
      })),
    [organizations]
  );

  const selectableOrganizations = useMemo(
    () =>
      relatedOrgs
        .filter(x => x.id !== props.orgId)
        .filter(x => !props.relatedOrgIds?.includes(x.id)),
    [relatedOrgs, props.orgId, props.relatedOrgIds]
  );

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={6}>
          <Section>
            <SectionHeader title={t("Add a district")} />
            <AutoCompleteSearch
              onClick={props.onAdd}
              searchText={searchText}
              setSearchText={setSearchText}
              options={districtOptions}
              placeholder={"District name"}
            />
          </Section>
        </Grid>
        {props.isAdmin && (
          <Grid item xs={12} md={6} lg={6}>
            <Section>
              <SectionHeader title={t("All district attributes")} />
              {props.allDistrictAttributes.length === 0 ? (
                <div>{t("No district attributes")}</div>
              ) : (
                props.allDistrictAttributes?.map((n, i) => (
                  <div key={i}>{n}</div>
                ))
              )}
            </Section>
          </Grid>
        )}
        <Grid item xs={12}>
          <Section>
            <SectionHeader title={t("Selected districts")} />
            {selectableOrganizations?.map((o, i) => {
              const org = relatedOrgs.find(x => x.id === o.id);
              if (org?.id) {
                return (
                  <div key={i}>
                    {org.name}
                    <TextButton onClick={() => props.onRemove(org.id ?? "")}>
                      {t("Remove")}
                    </TextButton>
                  </div>
                );
              }
            })}
          </Section>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: 0,
  },
  cancel: { color: theme.customColors.darkRed },
}));
