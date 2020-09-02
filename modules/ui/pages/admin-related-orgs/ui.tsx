import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { Select } from "ui/components/form/select";
import { CustomOrgUserRelationship } from "ui/pages/sub-related-orgs/helpers";
import { SectionHeader } from "ui/components/section-header";
import { OptionType } from "ui/components/form/select";
import { useQueryBundle } from "graphql/hooks";
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

  const { onAddOrg, onRemoveOrg, orgUserRelationships } = props;

  const sortedOrgUserRelationships = orgUserRelationships?.sort((a, b) =>
    a?.otherOrganization?.name && b?.otherOrganization?.name
      ? a.otherOrganization.name.toLowerCase() >
        b.otherOrganization.name.toLowerCase()
        ? 1
        : -1
      : 0
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
      districts
        .map(p => ({
          label: p?.name ?? "",
          value: p?.id ?? "",
        }))
        .filter(
          e =>
            e.value !==
            orgUserRelationships.find(
              o => o.otherOrganization?.orgId === e.value
            )?.otherOrganization?.orgId
        ),
    [districts, orgUserRelationships]
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Section>
          <SectionHeader title={t("Add a district")} />
          <Grid item xs={12} container className={classes.spacing}>
            {t("Search")}
          </Grid>
          <Select
            value={{
              value: "",
              label: "",
            }}
            multiple={false}
            onChange={(value: OptionType) => {
              onAddOrg(value.value.toString());
            }}
            options={districtOptions}
            withResetValue={false}
            doSort={false}
            placeholder={"District name"}
          />
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
