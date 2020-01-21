import { makeStyles } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { Typography, Grid, Link, Tooltip } from "@material-ui/core";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { PersonViewRoute } from "ui/routes/people";
import { useEndorsements } from "reference-data/endorsements";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Section } from "ui/components/section";
import {
  PositionType,
  PositionTypeQualifications,
} from "graphql/server-types.gen";
import { Input } from "ui/components/form/input";
import { DatePicker } from "ui/components/form/date-picker";
import {
  isDate,
  isBefore,
  differenceInDays,
  isSameDay,
  isPast,
} from "date-fns";
import { Warning, ErrorOutline } from "@material-ui/icons";
import { TFunction } from "i18next";
import { GetPositionTypeQualifications } from "../graphql/get-position-type-qualifications.gen";

type Props = {
  organizationId: string;
  orgUserId?: string;
  currentAttributes: Attribute[];
  addAttribute: (endorsementId: string) => Promise<boolean>;
  updateAttribute: (
    endorsementId: string,
    expirationDate?: Date | undefined
  ) => Promise<boolean>;
  removeAttribute: (endorsementId: string) => Promise<boolean>;
};

export type Attribute = {
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
  const [attributesAssigned, setAttributesAssigned] = useState<Attribute[]>(
    props.currentAttributes
  );
  const [positionTypeQualifications, setPositionTypeQualifications] = useState<
    GetPositionTypeQualifications.GetQualificationsFromEndorsements
  >({
    qualifiedPositionTypes: [],
    unqualifiedPositionTypes: [],
  });

  // Get Position Type Qualifications based off of current attributes
  const positionTypesQualificationsResponse = useQueryBundle(
    GetPositionTypeQualifications,
    {
      fetchPolicy: "cache-first",
      variables: {
        orgId: props.organizationId,
        endorsementIds: attributesAssigned
          .filter(a => !a.expirationDate || !isPast(a.expirationDate))
          .map(a => a.endorsementId),
      },
    }
  );
  // Keep Position Type qualifications in state to avoid losing data in UI while calling the server
  useEffect(() => {
    if (
      positionTypesQualificationsResponse.state === "DONE" &&
      positionTypesQualificationsResponse.data.positionType
    ) {
      setPositionTypeQualifications(
        positionTypesQualificationsResponse.data.positionType
          .getQualificationsFromEndorsements
      );
    }
  }, [positionTypesQualificationsResponse]);

  // Keep certain state variables in sync with props
  useEffect(() => {
    setAttributesAssigned(props.currentAttributes);
  }, [props.currentAttributes]);

  // const qualifiedPositionTypes = useMemo(() => {
  //   if (
  //     positionTypesQualificationsResponse.state === "DONE" &&
  //     positionTypesQualificationsResponse.data.positionType
  //   ) {
  //     return compact(positionTypesQualificationsResponse.data.positionType.getQualificationsFromEndorsements.qualifiedPositionTypes) ?? [];
  //   }
  //   return [];
  // }, [positionTypesQualificationsResponse]);
  // const unqualifiedPositionTypes = useMemo(() => {
  //   if (
  //     positionTypesQualificationsResponse.state === "DONE" &&
  //     positionTypesQualificationsResponse.data.positionType
  //   ) {
  //     return compact(positionTypesQualificationsResponse.data.positionType.getQualificationsFromEndorsements.unqualifiedPositionTypes) ?? [];
  //   }
  //   return [];
  // }, [positionTypesQualificationsResponse]);

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
            {positionTypeQualifications.qualifiedPositionTypes.map((p, i) => {
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
            {positionTypeQualifications.unqualifiedPositionTypes.length ===
            0 ? (
              <div className={classes.allOrNoneRow}>{t("None")}</div>
            ) : (
              positionTypeQualifications.unqualifiedPositionTypes.map(
                (p, i) => {
                  return (
                    <div key={i} className={getRowClasses(classes, i)}>
                      {p.name}
                    </div>
                  );
                }
              )
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
              <Grid container item xs={12}>
                <div className={classes.allOrNoneRow}>{t("None")}</div>
              </Grid>
            ) : (
              <>
                <Grid container item xs={12} className={classes.row}>
                  <Grid item xs={6}>
                    {t("Name")}
                  </Grid>
                  <Grid item xs={6}>
                    {t("Expires")}
                  </Grid>
                </Grid>
                {attributesAssigned.map((a, i) => {
                  return (
                    <Grid
                      container
                      item
                      alignItems="center"
                      xs={12}
                      key={i}
                      className={`${getRowClasses(classes, i)} ${
                        classes.selectedAttributeRow
                      }`}
                    >
                      <Grid item xs={6}>
                        {a.name}
                      </Grid>
                      <Grid item xs={4}>
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
                                const expirationDate = e.startDate as Date;

                                const updatedAttributesAssigned = [
                                  ...attributesAssigned,
                                ];
                                const attributeToUpdate = updatedAttributesAssigned.find(
                                  u => u.endorsementId === a.endorsementId
                                );

                                // Only make the call to the server if our expiration date
                                // has actually changed
                                if (
                                  attributeToUpdate &&
                                  (!attributeToUpdate.expirationDate ||
                                    !isSameDay(
                                      expirationDate,
                                      attributeToUpdate.expirationDate
                                    ))
                                ) {
                                  const result = await props.updateAttribute(
                                    a.endorsementId,
                                    expirationDate
                                  );
                                  if (result) {
                                    if (attributeToUpdate) {
                                      attributeToUpdate.expirationDate = expirationDate;
                                    }
                                    setAttributesAssigned(
                                      updatedAttributesAssigned
                                    );
                                  }
                                }
                              }
                            }}
                            startLabel={""}
                            endAdornment={getDatePickerAdornment(a, classes, t)}
                          />
                        )}
                      </Grid>
                      <Grid item xs={2} className={classes.removeSection}>
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
                      </Grid>
                    </Grid>
                  );
                })}
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
  row: {
    width: "100%",
    padding: theme.spacing(),
  },
  selectedAttributeRow: {
    minHeight: theme.typography.pxToRem(56),
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
  availableAttributeRow: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  addAction: {
    cursor: "pointer",
    textDecoration: "underline",
  },
  removeSection: {
    textAlign: "right",
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
  warning: {
    color: theme.customColors.warning,
  },
  expired: {
    color: theme.customColors.darkRed,
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

const getDatePickerAdornment = (
  attribute: Attribute,
  classes: any,
  t: TFunction
): React.ReactNode | undefined => {
  const dayWindowForWarning = 30;
  const expired = attributeIsExpired(attribute);
  const closeToExpiration =
    !expired && attributeIsCloseToExpiring(attribute, dayWindowForWarning);

  if (expired) {
    return (
      <Tooltip title={t("Attribute is expired")}>
        <ErrorOutline className={classes.expired} />
      </Tooltip>
    );
  }

  if (closeToExpiration) {
    return (
      <Tooltip
        title={t("Attribute will expire within {{dayWindowForWarning}} days", {
          dayWindowForWarning,
        })}
      >
        <Warning className={classes.warning} />
      </Tooltip>
    );
  }

  return undefined;
};

const attributeIsExpired = (attribute: Attribute): boolean => {
  if (!attribute.expirationDate) {
    return false;
  }

  const result = isBefore(attribute.expirationDate, new Date());
  return result;
};

const attributeIsCloseToExpiring = (
  attribute: Attribute,
  dayWindowForWarning: number
): boolean => {
  if (!attribute.expirationDate) {
    return false;
  }

  const result =
    differenceInDays(attribute.expirationDate, new Date()) <=
    dayWindowForWarning;
  return result;
};
