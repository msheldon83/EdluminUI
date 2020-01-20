import * as React from "react";
import { Grid, makeStyles, Checkbox } from "@material-ui/core";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { GetAllEndorsementsWithinOrg } from "ui/pages/position-type/graphql/get-all-endorsements.gen";
import { Input } from "ui/components/form/input";
import { Section } from "ui/components/section";
import { useQueryBundle } from "graphql/hooks";
import { useDeferredState } from "hooks";
import { useEffect } from "react";
import { SectionHeader } from "ui/components/section-header";

type Props = {
  orgId: string;
  handleMust: (ids: string[]) => Promise<void>;
  handleMustNot: (ids: string[]) => Promise<void>;
  handlePrefer: (ids: string[]) => Promise<void>;
  handlePreferNot: (ids: string[]) => Promise<void>;
};

export const AvailableAttributes: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [
    searchText,
    pendingSearchText,
    setPendingSearchText,
  ] = useDeferredState<string | undefined>(undefined, 200);
  useEffect(() => {}, [searchText]);

  const [endorsementIds, setEndorsementIds] = React.useState<string[]>([]);

  const updateSearchText = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingSearchText(event.target.value);
    },
    [setPendingSearchText]
  );

  const addEndorsement = (id: string, checked: boolean) => () => {
    if (checked) endorsementIds.push(id);
    else {
      const index = endorsementIds.indexOf(id);
      if (index > -1) {
        endorsementIds.splice(index, 1);
      }
    }
  };

  const getAllEndorsements = useQueryBundle(GetAllEndorsementsWithinOrg, {
    variables: { orgId: props.orgId, searchText: searchText },
  });

  if (getAllEndorsements.state === "LOADING") {
    return <></>;
  }

  const attributes =
    getAllEndorsements?.data?.orgRef_Endorsement?.all?.map(e => ({
      name: e?.name ?? "",
      id: e?.id ?? "",
    })) ?? [];

  return (
    <>
      <Grid item xs={12}>
        <Section>
          <SectionHeader title={t("Available Attributes")} />
          <Grid item xs={12} sm={6} md={6} lg={6}>
            <Input
              label={t("Attributes")}
              value={pendingSearchText ?? ""}
              onChange={updateSearchText}
              placeholder={t("Search")}
              className={classes.label}
            />
          </Grid>
          <div className={classes.fontColorGrey}>Add selected to:</div>
          <Grid item xs={12} sm={6} md={6} lg={6}>
            <TextButton
              color="primary"
              onClick={() => props.handleMust(endorsementIds)}
            >
              Substitutes must have
            </TextButton>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={6}>
            <TextButton
              color="primary"
              onClick={() => props.handlePrefer(endorsementIds)}
            >
              Prefer that substitutes have
            </TextButton>
          </Grid>

          <Grid item xs={12} sm={6} md={6} lg={6}>
            <TextButton
              color="primary"
              onClick={() => props.handlePreferNot(endorsementIds)}
            >
              Prefer that substitutes not have
            </TextButton>
          </Grid>

          <Grid item xs={12} sm={6} md={6} lg={6}>
            <TextButton
              color="primary"
              onClick={() => props.handleMustNot(endorsementIds)}
            >
              Substitutes must not have
            </TextButton>
          </Grid>

          <hr />
          <Grid item xs={12} sm={12} lg={12}>
            {attributes?.length === 0 ? (
              <div>{t("Not defined")}</div>
            ) : (
              attributes?.map((n, i) => (
                <Grid item xs={12} sm={12} lg={12} key={i}>
                  <Checkbox
                    onChange={e => addEndorsement(n.id, e.target.checked)}
                    checked={endorsementIds.includes(n.id)}
                    color="primary"
                  />
                  <div className={classes.inlineBlock}>{n.name}</div>
                </Grid>
              ))
            )}
          </Grid>
          <hr />
        </Section>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  label: {
    fontWeight: 500,
    marginBottom: theme.typography.pxToRem(4),
  },
  fontColorGrey: {
    color: theme.customColors.darkGray,
  },
  inlineBlock: {
    display: "inline-block",
  },
  alignRight: {
    align: "right",
  },
  link: {
    textDecoration: "none",
    color: "red",
  },
}));
