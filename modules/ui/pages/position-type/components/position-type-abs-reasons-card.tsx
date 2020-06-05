import * as React from "react";
import { Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useRouteParams } from "ui/routes/definition";
import { useLocation } from "react-router-dom";
import { AbsenceReasonViewEditRoute } from "ui/routes/absence-reason";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { AbsenceReasonLink } from "ui/components/links/reasons";

type Props = {
  positionTypeId: string;
  positionTypeName: string;
  updateAbsenceReasons: (values: {
    absenceReasonIds?: string[] | null;
  }) => Promise<any>;
};

export const PositionTypeAbsReasonsCard: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(AbsenceReasonViewEditRoute);
  const location = useLocation();

  const absenceReasons = useAbsenceReasons(params.organizationId);

  const sortedReasons = React.useMemo(
    () =>
      absenceReasons
        .slice()
        .sort((ar1, ar2) => ar1.name.localeCompare(ar2.name)),
    [absenceReasons]
  );

  if (sortedReasons.length === 0) {
    return <></>;
  }

  return (
    <Section>
      <SectionHeader title={t("Associated absence reasons")} />
      {sortedReasons.map(ar => (
        <Typography key={ar.id}>
          <AbsenceReasonLink
            absenceReasonId={ar.id}
            state={{
              comingFrom: `${props.positionTypeName} settings`,
              returnLocation: location,
            }}
          >
            {ar.name}
          </AbsenceReasonLink>
        </Typography>
      ))}
    </Section>
  );
};
