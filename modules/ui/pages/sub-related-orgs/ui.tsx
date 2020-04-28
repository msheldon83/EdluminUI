import * as React from "react";
import {
  Collapse,
  Divider,
  Grid,
  Link,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
import { useMemo } from "react";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { GetRelatedOrgs } from "./graphql/get-related-orgs.gen";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useQueryBundle } from "graphql/hooks";
import { AutoCompleteSearch } from "ui/components/autocomplete-search";

type Props = {
  relatedOrgIds: Array<string | null | undefined> | null | undefined;
  orgId: string;
  allDistrictAttributes: string[];
  onAdd: (orgId: string) => Promise<unknown>;
  onRemove: (orgId: string) => Promise<unknown>;
};

export const ManageDistrictsUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [searchText, setSearchText] = useState<string | undefined>();

  //Search for District Query
  // const getDistricts = useQueryBundle(GetAllLocationsWithinOrg, {
  //   variables: {
  //     orgId: params.organizationId,
  //     locationGroups: props.locationGroupFilter,
  //     searchText: props.searchText,
  //   },
  // });

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
            <AutoCompleteSearch searchText={searchText} />
          </Section>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Section>
            <SectionHeader title={t("All district attributes")} />
            {props.allDistrictAttributes.length === 0 ? (
              <div>{t("No district attributes")}</div>
            ) : (
              props.allDistrictAttributes?.map((n, i) => <div key={i}>{n}</div>)
            )}
          </Section>
        </Grid>
        <Grid item xs={12}>
          <Section>
            <SectionHeader title={t("Selected Organizations")} />
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
