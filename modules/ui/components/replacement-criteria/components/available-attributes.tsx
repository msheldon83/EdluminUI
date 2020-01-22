import * as React from "react";
import { Grid, makeStyles, Checkbox } from "@material-ui/core";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { useEndorsements } from "reference-data/endorsements";
import { Input } from "ui/components/form/input";
import { Section } from "ui/components/section";
import { PeopleRoute } from "ui/routes/people";
import { useCallback, useMemo } from "react";
import { useRouteParams } from "ui/routes/definition";
import { useDeferredState } from "hooks";
import { SectionHeader } from "ui/components/section-header";

type Props = {
  orgId: string;
  handleMust: (ids: string[]) => Promise<boolean>;
  handleMustNot: (ids: string[]) => Promise<boolean>;
  handlePrefer: (ids: string[]) => Promise<boolean>;
  handlePreferNot: (ids: string[]) => Promise<boolean>;
  endorsementsIgnored: { id: string; name: string }[];
  existingMust: { id: string; name: string }[];
  existingMustNot: { id: string; name: string }[];
  existingPrefer: { id: string; name: string }[];
  existingPreferNot: { id: string; name: string }[];
};

export const AvailableAttributes: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(PeopleRoute);

  const [
    searchText,
    pendingSearchText,
    setPendingSearchText,
  ] = useDeferredState<string | undefined>(undefined, 200);

  const [endorsementIds, setEndorsementIds] = React.useState<string[]>([]);

  const updateSearchText = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingSearchText(event.target.value);
    },
    [setPendingSearchText]
  );

  const endorsements = useEndorsements(
    params.organizationId,
    false,
    searchText
  );

  const attributes = useMemo(() => {
    return (
      endorsements
        .map(e => ({
          name: e?.name ?? "",
          id: e?.id ?? "",
        }))
        .filter(i => {
          return !props.endorsementsIgnored.find(
            ignored => ignored.id === i.id
          );
        }) ?? []
    );
  }, [endorsements, props.endorsementsIgnored]);

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
          <Grid item xs={12} sm={6}>
            <Input
              label={t("Attributes")}
              value={pendingSearchText ?? ""}
              onChange={updateSearchText}
              placeholder={t("Search")}
              className={classes.label}
            />
          </Grid>
          <div className={classes.fontColorGrey}>{t("Add selected to:")}</div>
          <Grid item xs={12} sm={6}>
            <TextButton
              color="primary"
              onClick={async () => {
                if (props.existingMust.length !== 0) {
                  props.existingMust.map(e => endorsementIds.push(e.id));
                }
                const result = await props.handleMust(endorsementIds);
                if (result) {
                  clearEndorsements();
                }
              }}
            >
              {t("Substitutes must have")}
            </TextButton>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextButton
              color="primary"
              onClick={async () => {
                if (props.existingPrefer.length !== 0) {
                  props.existingPrefer.map(e => endorsementIds.push(e.id));
                }
                const result = await props.handlePrefer(endorsementIds);
                if (result) {
                  clearEndorsements();
                }
              }}
            >
              {t("Prefer that substitutes have")}
            </TextButton>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextButton
              color="primary"
              onClick={async () => {
                if (props.existingPreferNot.length !== 0) {
                  props.existingPreferNot.map(e => endorsementIds.push(e.id));
                }
                const result = await props.handlePreferNot(endorsementIds);
                if (result) {
                  clearEndorsements();
                }
              }}
            >
              {t("Prefer that substitutes not have")}
            </TextButton>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextButton
              color="primary"
              onClick={async () => {
                if (props.existingMustNot.length !== 0) {
                  props.existingMustNot.map(e => endorsementIds.push(e.id));
                }
                const result = await props.handleMustNot(endorsementIds);
                if (result) {
                  clearEndorsements();
                }
              }}
            >
              {t("Substitutes must not have")}
            </TextButton>
          </Grid>
          <Grid item xs={12} sm={12} className={classes.topPadding}>
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
  },
  topPadding: {
    paddingTop: theme.spacing(3),
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
