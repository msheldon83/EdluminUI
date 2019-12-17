import * as React from "react";
import { Typography, Grid, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { GetEmployeeReplacementCriteria } from "../graphql/get-employee-replacementcriteria.gen";
import { useQueryBundle } from "graphql/hooks";
import { compact, flatMap } from "lodash-es";

type Props = {
  editing: string | null;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  employeeId: string;
};

export const ReplacementCriteria: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();

  const getReplacementCriteria = useQueryBundle(
    GetEmployeeReplacementCriteria,
    {
      variables: { id: props.employeeId },
    }
  );
  const replacementCriteria =
    getReplacementCriteria.state === "LOADING"
      ? []
      : compact(
          getReplacementCriteria?.data?.replacementCriteria
            ?.replacementCriteriaByEmployee ?? []
        );

  // RequireUntilLeadTimeMinutesRemain and RequiredUntilLeadTimePercentRemain == 0 && includeMatchingCandidates == true
  const subMustHave: (string | undefined)[] = (() => {
    const criteria = replacementCriteria.filter(x => {
      const config = x.replacementCriteriaConfig;
      if (config) {
        return (
          config.includeMatchingCandidates &&
          (config.requiredUntilLeadTimeMinutesRemain === null ||
            config.requiredUntilLeadTimeMinutesRemain === 0) &&
          (config.requiredUntilLeadTimePercentRemain === null ||
            config.requiredUntilLeadTimePercentRemain === 0)
        );
      }
    });
    if (criteria.length === 0) {
      return [];
    }
    const replacementCriterion =
      flatMap(criteria, (r => r.replacementCriterion) ?? []) ?? [];
    return (
      replacementCriterion.map(r => {
        if (r && r.endorsement) {
          return r?.endorsement?.name;
        }
      }) ?? []
    );
  })();

  // RequireUntilLeadTimeMinutesRemain and RequiredUntilLeadTimePercentRemain == 0 && includeMatchingCandidates == false
  const subMustNotHave: (string | undefined)[] = (() => {
    const criteria = replacementCriteria.filter(x => {
      const config = x.replacementCriteriaConfig;
      if (config) {
        return (
          !config.includeMatchingCandidates &&
          (config.requiredUntilLeadTimeMinutesRemain === null ||
            config.requiredUntilLeadTimeMinutesRemain === 0) &&
          (config.requiredUntilLeadTimePercentRemain === null ||
            config.requiredUntilLeadTimePercentRemain === 0)
        );
      }
    });
    if (criteria.length === 0) {
      return [];
    }
    const replacementCriterion =
      flatMap(criteria, (r => r.replacementCriterion) ?? []) ?? [];
    return (
      replacementCriterion.map(r => {
        if (r && r.endorsement) {
          return r?.endorsement?.name;
        }
      }) ?? []
    );
  })();

  // RequireUntilLeadTimeMinutesRemain and RequiredUntilLeadTimePercentRemain > 0 && includeMatchingCandidates == true
  const preferSubHave: (string | undefined)[] = (() => {
    const criteria = replacementCriteria.filter(x => {
      const config = x.replacementCriteriaConfig;
      if (config) {
        return (
          config.includeMatchingCandidates &&
          config.requiredUntilLeadTimeMinutesRemain &&
          config.requiredUntilLeadTimeMinutesRemain > 0 &&
          config.requiredUntilLeadTimePercentRemain &&
          config.requiredUntilLeadTimePercentRemain > 0
        );
      }
    });
    if (criteria.length === 0) {
      return [];
    }
    const replacementCriterion =
      flatMap(criteria, (r => r.replacementCriterion) ?? []) ?? [];
    return (
      replacementCriterion.map(r => {
        if (r && r.endorsement) {
          return r?.endorsement?.name;
        }
      }) ?? []
    );
  })();
  // RequireUntilLeadTimeMinutesRemain and RequiredUntilLeadTimePercentRemain > 0 && includeMatchingCandidates == false
  const preferSubNotHave: (string | undefined)[] = (() => {
    const criteria = replacementCriteria.filter(x => {
      const config = x.replacementCriteriaConfig;
      if (config) {
        return (
          !config.includeMatchingCandidates &&
          config.requiredUntilLeadTimeMinutesRemain &&
          config.requiredUntilLeadTimeMinutesRemain > 0 &&
          config.requiredUntilLeadTimePercentRemain &&
          config.requiredUntilLeadTimePercentRemain > 0
        );
      }
    });
    if (criteria.length === 0) {
      return [];
    }
    const replacementCriterion =
      flatMap(criteria, (r => r.replacementCriterion) ?? []) ?? [];
    return (
      replacementCriterion.map(r => {
        if (r && r.endorsement) {
          return r?.endorsement?.name;
        }
      }) ?? []
    );
  })();

  return (
    <>
      <Section>
        <SectionHeader
          title={t("Replacement criteria")}
          action={{
            text: t("Edit"),
            visible: !props.editing,
            execute: () => {
              const editSettingsUrl = "/"; //TODO figure out the URL for editing
              history.push(editSettingsUrl);
            },
          }}
        />
        <Grid container spacing={2}>
          {getReplacementCriteria.state === "LOADING" ? (
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Loading")}</Typography>
            </Grid>
          ) : (
            <>
              <Grid container item spacing={2} xs={8}>
                <Grid item xs={12} sm={6} lg={6}>
                  <Typography variant="h6">
                    {t("Substitutes must have")}
                  </Typography>
                  {subMustHave.length === 0 ? (
                    <div>{t("Not defined")}</div>
                  ) : (
                    subMustHave.map((n, i) => <div key={i}>{n}</div>)
                  )}
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <Typography variant="h6">
                    {t("Prefer that substitutes have")}
                  </Typography>
                  {preferSubHave.length === 0 ? (
                    <div>{t("Not defined")}</div>
                  ) : (
                    preferSubHave.map((n, i) => <div key={i}>{n}</div>)
                  )}
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <Typography variant="h6">
                    {t("Substitutes must not have")}
                  </Typography>
                  {subMustNotHave.length === 0 ? (
                    <div>{t("Not defined")}</div>
                  ) : (
                    subMustNotHave.map((n, i) => <div key={i}>{n}</div>)
                  )}
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <Typography variant="h6">
                    {t("Prefer that subsittutes not have")}
                  </Typography>
                  {preferSubNotHave.length === 0 ? (
                    <div>{t("Not defined")}</div>
                  ) : (
                    preferSubNotHave.map((n, i) => <div key={i}>{n}</div>)
                  )}
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      </Section>
    </>
  );
};
