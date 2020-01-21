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
import { GetRelatedOrgs } from "./graphql/get-relatedorgs.gen";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useQueryBundle } from "graphql/hooks";

type Props = {
  relatedOrgIds: Array<string | null | undefined> | null | undefined;
  orgId: string;
  onAdd: (orgId: string) => Promise<unknown>;
  onRemove: (orgId: string) => Promise<unknown>;
};

export const RelatedOrgsUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

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

  // TODO: this page needs styling
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={6}>
          <Section>
            <SectionHeader title={t("Related Organizations")} />
            {props.relatedOrgIds?.map((o, i) => {
              const org = relatedOrgs.find(x => x.id === o);
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
        <Grid item xs={12} md={6} lg={6}>
          <Section>
            <SectionHeader title={t("Organizations")} />
            {selectableOrganizations.map((o, i) => {
              if (o?.id) {
                return (
                  <div key={i}>
                    {o.name}
                    <TextButton onClick={() => props.onAdd(o.id ?? "")}>
                      {t("Add")}
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
