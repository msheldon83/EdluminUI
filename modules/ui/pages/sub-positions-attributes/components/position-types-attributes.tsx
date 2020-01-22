import { makeStyles } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { Typography, Grid, Link } from "@material-ui/core";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { PersonViewRoute } from "ui/routes/people";
import { useEndorsements } from "reference-data/endorsements";
import { GetAllPositionTypesWithReplacementCriteria } from "../graphql/get-all-position-types.gen";
import { compact } from "lodash-es";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Section } from "ui/components/section";
import {
  EmployeeEndorsement,
  PositionType,
  Endorsement,
} from "graphql/server-types.gen";
import { Input } from "ui/components/form/input";
import { DatePicker } from "ui/components/form/date-picker";
import { isDate } from "date-fns";

type Props = {
  organizationId: string;
  orgUserId?: string;
  qualifiedPositionTypes: Pick<PositionType, "id" | "name">[];
  currentAttributes: Attributes[];
  addAttribute: (endorsementId: string) => Promise<boolean>;
  updateAttribute: (
    endorsementId: string,
    expirationDate?: Date | undefined
  ) => Promise<boolean>;
  removeAttribute: (endorsementId: string) => Promise<boolean>;
};

export type Attributes = {
  endorsementId: string;
  name: string;
  expirationDate?: Date | null | undefined;
  expires: boolean;
};

export const SubPositionTypesAndAttributesEdit: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(PersonViewRoute);
  const allEndorsements = useEndorsements(props.organizationId, false);

  // State variables
  const [endorsementSearchText, setEndorsementSearchText] = useState<
    string | undefined
  >(undefined);
  const [attributesAssigned, setAttributesAssigned] = useState<Attributes[]>(
    props.currentAttributes
  );

  // Keep certain state variables in sync with props
  useEffect(() => {
    setAttributesAssigned(props.currentAttributes);
  }, [props.currentAttributes]);

  // Get all of the Position Types in the Org
  const positionTypeResponse = useQueryBundle(
    GetAllPositionTypesWithReplacementCriteria,
    {
      fetchPolicy: "cache-first",
      variables: { orgId: props.organizationId },
    }
  );
  const allPositionTypes = useMemo(() => {
    if (
      positionTypeResponse.state === "DONE" &&
      positionTypeResponse.data.positionType
    ) {
      return compact(positionTypeResponse.data.positionType.all) ?? [];
    }
    return [];
  }, [positionTypeResponse]);

  // Determine which Position Types the Sub isn't currently qualified for
  const unqualifiedPositionTypes = useMemo(() => {
    return allPositionTypes.filter(
      p => !props.qualifiedPositionTypes.find(q => q?.id === p.id)
    );
  }, [props.qualifiedPositionTypes, allPositionTypes]);

  // Determine which endorsements/attribute the Sub doesn't have yet
  const missingEndorsements = useMemo(
    () =>
      allEndorsements.filter(
        e => !attributesAssigned.find(c => c.endorsementId === e.id)
      ),
    [attributesAssigned, allEndorsements]
  );

  // Filter the endorsements/attributes based on User search text input
  const filteredEndorsements = useMemo(() => {
    if (!missingEndorsements || missingEndorsements.length === 0) {
      return [];
    }

    if (endorsementSearchText) {
      return missingEndorsements.filter(e =>
        e.name.toLowerCase().includes(endorsementSearchText.toLowerCase())
      );
    }

    return missingEndorsements;
  }, [endorsementSearchText, missingEndorsements]);

  return (
    <>
      <Section>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <Typography variant="h5" className={classes.sectionHeader}>
              {t("Qualified for position types")}
            </Typography>
            {props.qualifiedPositionTypes.map((p, i) => {
              return (
                <div key={i} className={getRowClasses(classes, i)}>
                  {p.name}
                </div>
              );
            })}
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h5" className={classes.sectionHeader}>
              {t("Not qualified for position types")}
            </Typography>
            {unqualifiedPositionTypes.length === 0 ? (
              <div className={classes.allOrNoneRow}>{t("None")}</div>
            ) : (
              unqualifiedPositionTypes.map((p, i) => {
                return (
                  <div key={i} className={getRowClasses(classes, i)}>
                    {p.name}
                  </div>
                );
              })
            )}
          </Grid>
        </Grid>
      </Section>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Section className={classes.attributesSection}>
            <Typography variant="h5" className={classes.sectionHeader}>
              {t("Selected attributes")}
            </Typography>
            {attributesAssigned.length === 0 ? (
              <div className={classes.allOrNoneRow}>{t("None")}</div>
            ) : (
              <>
                <div className={classes.currentAttributeRow}>
                  <div className={classes.currentAttributeColumn}>
                    <div className={classes.rowHeader}>{t("Name")}</div>
                    {attributesAssigned.map((a, i) => {
                      return (
                        <div key={i} className={getRowClasses(classes, i)}>
                          {a.name}
                        </div>
                      );
                    })}
                  </div>
                  <div className={classes.currentAttributeColumn}>
                    <div className={classes.rowHeader}>{t("Expires")}</div>
                    {attributesAssigned.map((a, i) => {
                      return (
                        <div key={i} className={getRowClasses(classes, i)}>
                          <div className={classes.updateAttributeItems}>
                            {!a.expires ? (
                              <div className={classes.allOrNoneRow}>
                                {t("Does not expire")}
                              </div>
                            ) : (
                              <DatePicker
                                variant={"single-hidden"}
                                startDate={a.expirationDate ?? ""}
                                onChange={async e => {
                                  if (isDate(e.startDate)) {
                                    const startDate = e.startDate as Date;
                                    const result = await props.updateAttribute(
                                      a.endorsementId,
                                      startDate
                                    );
                                    if (result) {
                                      const updatedAttributesAssigned = [
                                        ...attributesAssigned,
                                      ];
                                      const attributeToUpdate = updatedAttributesAssigned.find(
                                        u => u.endorsementId === a.endorsementId
                                      );
                                      if (attributeToUpdate) {
                                        attributeToUpdate.expirationDate = startDate;
                                      }
                                      setAttributesAssigned(
                                        updatedAttributesAssigned
                                      );
                                    }
                                  }
                                }}
                                startLabel={""}
                              />
                            )}
                            <Link
                              className={classes.removeAction}
                              onClick={async () => {
                                const result = await props.removeAttribute(
                                  a.endorsementId
                                );
                                if (result) {
                                  setAttributesAssigned([
                                    ...attributesAssigned.filter(
                                      u => u.endorsementId !== a.endorsementId
                                    ),
                                  ]);
                                }
                              }}
                            >
                              {t("Remove")}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </Section>
        </Grid>
        <Grid item xs={6}>
          <Section className={classes.attributesSection}>
            <Typography variant="h5" className={classes.sectionHeader}>
              {t("Available attributes")}
            </Typography>
            <div className={classes.searchTextInput}>
              <Input
                label={t("Attribute")}
                placeholder={t("Search")}
                onChange={e => setEndorsementSearchText(e.target.value)}
              />
            </div>
            <Grid container item xs={12}>
              {!!endorsementSearchText && filteredEndorsements.length === 0 && (
                <div className={classes.allOrNoneRow}>
                  {t("No attributes found")}
                </div>
              )}
              {filteredEndorsements.map((e, i) => {
                return (
                  <div
                    key={i}
                    className={`${
                      classes.availableAttributeRow
                    } ${getRowClasses(classes, i)}`}
                  >
                    <div>{e.name}</div>
                    <div>
                      <Link
                        className={classes.addAction}
                        onClick={async () => {
                          const result = await props.addAttribute(e.id);
                          if (result) {
                            setAttributesAssigned([
                              ...attributesAssigned,
                              {
                                endorsementId: e.id,
                                name: e.name,
                                expires: e.expires,
                              },
                            ]);
                          }
                        }}
                      >
                        {t("Add")}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </Grid>
          </Section>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  sectionHeader: {
    marginBottom: theme.spacing(2),
  },
  allOrNoneRow: {
    color: theme.customColors.edluminSubText,
  },
  rowHeader: {
    padding: theme.spacing(),
  },
  row: {
    width: "100%",
    padding: theme.spacing(),
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
  currentAttributeRow: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  currentAttributeColumn: {
    flexGrow: 1,
  },
  updateAttributeItems: {
    display: "flex",
    justifyContent: "space-between",
  },
  availableAttributeRow: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  addAction: {
    cursor: "pointer",
    textDecoration: "underline",
  },
  removeAction: {
    cursor: "pointer",
    textDecoration: "underline",
    color: theme.customColors.darkRed,
  },
  attributesSection: {
    height: "100%",
  },
  searchTextInput: {
    width: "50%",
    marginBottom: theme.spacing(2),
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
