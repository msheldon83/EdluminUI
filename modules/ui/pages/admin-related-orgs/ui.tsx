import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Section } from "ui/components/section";
import { SelectNew } from "ui/components/form/select-new";
import { CustomOrgUserRelationship } from "ui/pages/sub-related-orgs/helpers";
import { SectionHeader } from "ui/components/section-header";
import { OptionType } from "ui/components/form/select-new";
import { useQueryBundle } from "graphql/hooks";
import { AutoCompleteSearch } from "ui/components/autocomplete-search";
import { SelectedDistricts } from "./components/selected-districts";
import { GetDelegatesToOrganizations } from "./graphql/get-related-orgs.gen";

type Props = {
  orgId: string;
  onAddOrg: (orgId: string) => Promise<unknown>;
  onRemoveOrg: (orgId: string) => Promise<unknown>;
  orgUserRelationships: CustomOrgUserRelationship[];
};

export const ManageDistrictsUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [searchText, setSearchText] = useState<string | undefined>();

  const { onAddOrg, onRemoveOrg, orgUserRelationships } = props;

  const sortedOrgUserRelationships = orgUserRelationships?.sort((a, b) =>
    a?.otherOrganization?.name!.toLowerCase() >
    b?.otherOrganization?.name!.toLowerCase()
      ? 1
      : -1
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

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Section>
          <SectionHeader title={t("Add a district")} />
          <Grid item xs={12} container className={classes.spacing}>
            {t("Search")}
          </Grid>
          <SelectNew
            // value={{
            //   value: values.availability,
            //   label:
            //     availabilityOptions.find(
            //       e => e.value && e.value === values.availability
            //     )?.label || "",
            // }}
            multiple={false}
            onChange={(value: OptionType) => {
              const result = onAddOrg(value.value.toString());
            }}
            options={districtOptions}
            withResetValue={false}
            doSort={false}
          />
          {/* <AutoCompleteSearch
            onClick={onAddOrg}
            searchText={searchText}
            setSearchText={setSearchText}
            options={districtOptions}
            placeholder={"District name"}
          /> */}
        </Section>
      </Grid>
      <Grid item xs={12}>
        <SelectedDistricts
          orgUserRelationships={sortedOrgUserRelationships}
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
