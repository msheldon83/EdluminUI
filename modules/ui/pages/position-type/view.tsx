import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { GetPositionTypeById } from "ui/pages/position-type/position-type.gen";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { oc } from "ts-optchain";
import { Grid } from "@material-ui/core";

type Props = {
  match: Match;
};
type Match = {
  params: MatchParams;
};
type MatchParams = {
  positionTypeId: number;
};

export const PositionTypeViewPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    match: {
      params: { positionTypeId },
    },
  } = props;

  const getPositionType = useQueryBundle(GetPositionTypeById, {
    variables: { id: positionTypeId },
  });

  if (getPositionType.state === "LOADING") {
    return <></>;
  }

  const positionType = oc(getPositionType).data.positionType.byId();
  if (!positionType) {
    return <></>;
  }

  return (
    <>
      <PageTitle title={positionType.name} />
      <div>{`${t("External Id")} ${positionType.externalId || "NONE"}`}</div>
      <Section>
        <h3>{t("Settings")}</h3>
        <Grid container>
          <Grid item xs={6}>
            <div>{t("Use For Employees")}</div>
            <div>{positionType.forPermanentPositions ? t("Yes") : t("No")}</div>
          </Grid>
          <Grid item xs={6}>
            <div>{t("Needs Substitute (default)")}</div>
            <div>{positionType.needsReplacement ? t("Yes") : t("No")}</div>
          </Grid>
          <Grid item xs={12}>
            <div>{t("Use For Vacancies")}</div>
            <div>{positionType.forStaffAugmentation ? t("Yes") : t("No")}</div>
          </Grid>
          <Grid item xs={12}>
            <div>{t("Minimum Absence Duration")}</div>
            <div>{positionType.minAbsenceDurationMinutes}</div>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};
