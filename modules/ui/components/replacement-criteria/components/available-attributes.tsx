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
  handleMust: (ids: string[]) => Promise<boolean>;
  handleMustNot: (ids: string[]) => Promise<boolean>;
  handlePrefer: (ids: string[]) => Promise<boolean>;
  handlePreferNot: (ids: string[]) => Promise<boolean>;
  endorsementsIgnored: { id: string; name: string }[];
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

  const getAllEndorsements = useQueryBundle(GetAllEndorsementsWithinOrg, {
    variables: { orgId: props.orgId, searchText: searchText },
  });

  if (getAllEndorsements.state === "LOADING") {
    return <></>;
  }

  const attributes =
    getAllEndorsements?.data?.orgRef_Endorsement?.all
      ?.map(e => ({
        name: e?.name ?? "",
        id: e?.id ?? "",
      }))
      .filter(i => {
        return !props.endorsementsIgnored.find(ignored => ignored.id === i.id);
      }) ?? [];

  const clearEndorsements = () => {
    endorsementIds.length = 0;
  };

  const addEndorsement = (id: string, checked: boolean) => {
    if (checked) {
      setEndorsementIds([...endorsementIds, id]);
    } else {
      setEndorsementIds([...endorsementIds].filter(e => e !== id));
    }
  };

  const checkedValue = (id: string) => {
    if (endorsementIds.includes(id)) {
      return true;
    } else return false;
  };

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
              onClick={async () => {
                const result = await props.handleMust(endorsementIds);
                if (result) {
                  clearEndorsements();
                }
              }}
            >
              Substitutes must have
            </TextButton>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={6}>
            <TextButton
              color="primary"
              onClick={async () => {
                const result = await props.handlePrefer(endorsementIds);
                if (result) {
                  clearEndorsements();
                }
              }}
            >
              Prefer that substitutes have
            </TextButton>
          </Grid>
          <Grid item xs={12} sm={6} md={6} lg={6}>
            <TextButton
              color="primary"
              onClick={async () => {
                const result = await props.handlePreferNot(endorsementIds);
                if (result) {
                  clearEndorsements();
                }
              }}
            >
              Prefer that substitutes not have
            </TextButton>
          </Grid>

          <Grid item xs={12} sm={6} md={6} lg={6}>
            <TextButton
              color="primary"
              onClick={async () => {
                const result = await props.handleMustNot(endorsementIds);
                if (result) {
                  clearEndorsements();
                }
              }}
            >
              Substitutes must not have
            </TextButton>
          </Grid>
          <Grid item xs={12} sm={12} lg={12}>
            {attributes?.length === 0 ? (
              <div className={classes.allOrNoneRow}>
                {t("No Attributes created yet")}
              </div>
            ) : (
              attributes?.map((n, i) => (
                <div
                  key={i}
                  className={`${classes.endorsementRow} ${getRowClasses(
                    classes,
                    i
                  )}`}
                >
                  <Checkbox
                    onChange={e => addEndorsement(n.id, e.target.checked)}
                    checked={checkedValue(n.id)}
                    color="primary"
                  />
                  <div className={classes.inlineBlock}>{n.name}</div>
                </div>
              ))
            )}
          </Grid>
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
  endorsementRow: {
    width: "100%",
    display: "flex",
  },
  inlineBlock: {
    paddingTop: theme.typography.pxToRem(11),
    display: "inline-block",
  },
  firstRow: {
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
  },
  shadedRow: {
    background: theme.customColors.lightGray,
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    borderBottom: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
  },
  allOrNoneRow: {
    color: theme.customColors.edluminSubText,
  },
  row: {
    width: "100%",
    padding: theme.spacing(),
  },
}));

const getRowClasses = (classes: any, index: number): string => {
  const rowClasses = [classes.row];
  if (index === 0) {
    rowClasses.push(classes.firstRow);
  }
  if (index % 2 === 1) {
    rowClasses.push(classes.shadedRow);
  }
  return rowClasses.join(" ");
};
