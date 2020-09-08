import * as React from "react";
import { Divider, Grid, makeStyles } from "@material-ui/core";
import { TextButton } from "ui/components/text-button";
import { useTranslation } from "react-i18next";
import { Select, OptionType } from "ui/components/form/select";
import { useState } from "react";
import { Formik } from "formik";
import {
  SubstituteInput,
  SubstituteAttributeInput,
  SubstituteRelatedOrgInput,
} from "graphql/server-types.gen";
import { Section } from "ui/components/section";
import clsx from "clsx";
import { CustomOrgUserRelationship } from "../helpers";
import { SectionHeader } from "ui/components/section-header";
import { EndorsementDetail } from "./endorsement-detail";

type Props = {
  orgUserRelationships: CustomOrgUserRelationship[];
  onRemoveOrg: (orgId: string) => Promise<unknown>;
  orgEndorsements?: OptionType[];
  onSave: (sub: SubstituteInput) => Promise<any>;
};

export const SelectedDistricts: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { orgUserRelationships, onRemoveOrg, orgEndorsements, onSave } = props;

  const sortedOrgUserRelationships = orgUserRelationships?.sort((a, b) =>
    a?.otherOrganization?.name && b?.otherOrganization?.name
      ? a.otherOrganization.name.toLowerCase() >
        b.otherOrganization.name.toLowerCase()
        ? 1
        : -1
      : 0
  );

  const sortedOrgEndorsements = orgEndorsements?.sort((a, b) =>
    a?.label?.toLowerCase() > b?.label?.toLowerCase() ? 1 : -1
  );

  const initialValues = { orgUserRelationships: sortedOrgUserRelationships };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      onSubmit={async (data, meta) => {
        const relatedOrgs: SubstituteRelatedOrgInput[] =
          data?.orgUserRelationships?.map(o => ({
            orgId: o?.otherOrganization?.orgId ?? "",
            attributes:
              o?.attributes?.map(
                x =>
                  ({
                    attribute: { id: x?.endorsementId ?? "" },
                    expires: x?.expirationDate ?? undefined,
                  } as SubstituteAttributeInput)
              ) ?? ([] as SubstituteAttributeInput[]),
          })) ?? [];

        await onSave({ relatedOrgs });
      }}
    >
      {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
        <form onSubmit={handleSubmit}>
          <Section>
            <SectionHeader title={t("Selected districts")} />
            <Grid item xs={4} container className={classes.inline}>
              <div className={classes.paddingLeft}>{t("Name")}</div>
            </Grid>
            <Grid item xs={4} container className={classes.inline}>
              <div className={classes.paddingLeft}>
                {t("District specific attributes")}
              </div>
            </Grid>
            <Grid item xs={4} container className={classes.inline} />
            <Divider />
            {orgUserRelationships?.length === 0 ? (
              <div className={classes.containerPadding}>
                {t("No selected districts")}
              </div>
            ) : (
              values.orgUserRelationships.map((n, i) => {
                if (n) {
                  return (
                    <div key={i}>
                      <Grid
                        item
                        xs={12}
                        className={clsx({
                          [classes.background]: i % 2,
                          [classes.containerPadding]: true,
                        })}
                      >
                        <Grid
                          item
                          xs={4}
                          container
                          className={clsx({
                            [classes.inline]: true,
                            [classes.verticalAlignTop]: true,
                          })}
                        >
                          <div className={classes.paddingLeft}>
                            {n?.otherOrganization?.name}
                          </div>
                        </Grid>
                        <Grid item xs={4} container className={classes.inline}>
                          <div className={classes.paddingTop}>
                            <Select
                              value={{
                                value: "",
                                label: "",
                              }}
                              multiple={false}
                              placeholder={t("search")}
                              onChange={(value: OptionType) => {
                                values.orgUserRelationships[i].attributes.push({
                                  endorsementId: value.value.toString(),
                                  name: value.label,
                                });
                                handleSubmit();
                              }}
                              options={sortedOrgEndorsements ?? []}
                              withResetValue={false}
                            />
                          </div>
                          {n?.attributes?.length === 0 ? (
                            <div></div>
                          ) : (
                            n?.attributes?.map((endorsement: any, j) => (
                              <EndorsementDetail
                                key={j}
                                onRemoveEndorsement={() => {
                                  {
                                    values.orgUserRelationships[
                                      i
                                    ]?.attributes.splice(j, 1);
                                    setFieldValue(
                                      "orgUserRelationships",
                                      values.orgUserRelationships
                                    );

                                    handleSubmit();
                                  }
                                }}
                                expirationDate={endorsement?.expirationDate}
                                orgRelationshipIndex={i}
                                endorsementIndex={j}
                                name={endorsement.name}
                                setFieldValue={setFieldValue}
                                submitForm={submitForm}
                              />
                            ))
                          )}
                        </Grid>
                        <Grid
                          item
                          xs={4}
                          container
                          className={clsx({
                            [classes.inline]: true,
                            [classes.verticalAlignTop]: true,
                          })}
                        >
                          <TextButton
                            className={clsx({
                              [classes.paddingRight]: true,
                              [classes.floatRight]: true,
                              [classes.linkText]: true,
                            })}
                            onClick={() =>
                              onRemoveOrg(n.otherOrganization?.orgId ?? "")
                            }
                          >
                            {t("Remove")}
                          </TextButton>
                        </Grid>
                      </Grid>
                    </div>
                  );
                }
              })
            )}
          </Section>
        </form>
      )}
    </Formik>
  );
};

const useStyles = makeStyles(theme => ({
  inline: {
    display: "inline-block",
  },
  floatRight: {
    float: "right",
  },
  verticalAlignTop: {
    verticalAlign: "top",
    paddingTop: theme.spacing(2),
  },
  paddingRight: {
    paddingRight: theme.spacing(2),
  },
  paddingLeft: {
    paddingLeft: theme.spacing(2),
  },
  paddingTop: {
    padding: theme.spacing(2),
  },
  linkText: {
    color: theme.customColors.primary,
  },
  background: {
    backgroundColor: theme.customColors.lightGray,
  },
  containerPadding: {
    paddingBottom: theme.spacing(1),
  },
}));
