import { makeStyles } from "@material-ui/styles";
import { useIsMobile, useDeferredState } from "hooks";
import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { Typography, Grid, Link, Tooltip } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { PersonViewRoute } from "ui/routes/people";
import { useEndorsements } from "reference-data/endorsements";
import { useMemo, useState, useEffect } from "react";
import { Section } from "ui/components/section";
import { Input } from "ui/components/form/input";
import { DatePicker } from "ui/components/form/date-picker";
import { isDate, isSameDay, isPast } from "date-fns";
import { Warning, ErrorOutline } from "@material-ui/icons";
import { TFunction } from "i18next";
import { GetPositionTypeQualifications } from "../graphql/get-position-type-qualifications.gen";
import { Attribute } from "../types";
import {
  attributeIsExpired,
  attributeIsCloseToExpiring,
  dayWindowForWarning,
} from "../helpers";

type Props = {
  organizationId: string;
  orgUserId?: string;
  currentAttributes: Attribute[];
  addAttribute: (attribute: Attribute) => Promise<boolean>;
  updateAttribute: (
    endorsementId: string,
    expirationDate?: Date | undefined
  ) => Promise<boolean>;
  removeAttribute: (endorsementId: string) => Promise<boolean>;
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
  const [
    attributesAssigned,
    pendingAttributesAssigned,
    setPendingAttributesAssigned,
  ] = useDeferredState(props.currentAttributes, 500);

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
    setPendingAttributesAssigned(props.currentAttributes);
  }, [props.currentAttributes, setPendingAttributesAssigned]);

  // Determine which endorsements/attribute the Sub doesn't have yet
  const missingEndorsements = useMemo(
    () =>
      allEndorsements.filter(
        e => !pendingAttributesAssigned.find(c => c.endorsementId === e.id)
      ),
    [pendingAttributesAssigned, allEndorsements]
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
      <Grid item xs={12} container className={classes.tipSection}>
        <Grid item xs={1} className={classes.infoIcon}>
          <InfoIcon />
        </Grid>
        <Grid item xs={10}>
          <div className={classes.noteText}>
            {t(
              "Note: Selecting attributes below will automatically update the position types for which this person is qualified."
            )}
          </div>
        </Grid>
      </Grid>
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
              <div className={classes.greyedOutText}>{t("None")}</div>
            ) : (
              positionTypeQualifications.unqualifiedPositionTypes.map(
                (p, i) => {
                  const mustHaves = p.replacementCriteria?.mustHave ?? [];
                  const mustNotHaves = p.replacementCriteria?.mustNotHave ?? [];

                  return (
                    <Grid
                      container
                      item
                      xs={12}
                      key={i}
                      className={getRowClasses(classes, i)}
                    >
                      <Grid item xs={6}>
                        {p.name}
                      </Grid>
                      <Grid item xs={6}>
                        {mustHaves.length > 0 && (
                          <div>
                            <span className={classes.greyedOutText}>
                              {t("Needs")}:
                            </span>{" "}
                            {mustHaves.map(m => m!.name).join(", ")}
                          </div>
                        )}
                        {mustNotHaves.length > 0 && (
                          <div>
                            <span className={classes.greyedOutText}>
                              {t("Can't have")}:
                            </span>{" "}
                            {mustNotHaves.map(m => m!.name).join(", ")}
                          </div>
                        )}
                      </Grid>
                    </Grid>
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
            {pendingAttributesAssigned.length === 0 ? (
              <Grid container item xs={12}>
                <div className={classes.greyedOutText}>{t("None")}</div>
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
                {pendingAttributesAssigned.map((a, i) => {
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
                          <div className={classes.greyedOutText}>
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
                                  ...pendingAttributesAssigned,
                                ];
                                const attributeToUpdate = updatedAttributesAssigned.find(
                                  u => u.endorsementId === a.endorsementId
                                );

                                // Only make the call to the server if our
                                // expiration date has actually changed
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
                                    setPendingAttributesAssigned(
                                      updatedAttributesAssigned
                                    );
                                  }
                                }
                              }
                            }}
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
                              setPendingAttributesAssigned([
                                ...pendingAttributesAssigned.filter(
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
                <div className={classes.greyedOutText}>
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
                          const attributeObj = {
                            endorsementId: e.id,
                            name: e.name,
                            expires: e.expires,
                          };
                          const result = await props.addAttribute(attributeObj);
                          if (result) {
                            setPendingAttributesAssigned([
                              ...pendingAttributesAssigned,
                              attributeObj,
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
  greyedOutText: {
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
  infoIcon: {
    color: theme.customColors.darkBlue,
    marginTop: "5px",
    marginLeft: "10px",
  },
  noteText: {
    color: theme.customColors.darkBlue,
    fontWeight: "bold",
    marginTop: "7px",
    textAlign: "center",
  },
  searchTextInput: {
    width: "50%",
    marginBottom: theme.spacing(2),
  },
  tipSection: {
    backgroundColor: theme.customColors.lightBlue,
    padding: "10px",
    marginBottom: "20px",
    border: "1px solid",
    borderColor: theme.customColors.darkBlue,
    borderRadius: "4px",
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
