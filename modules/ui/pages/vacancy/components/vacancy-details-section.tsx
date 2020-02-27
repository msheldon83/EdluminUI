import * as React from "react";
import { SelectNew as Select } from "ui/components/form/select-new";
import { PositionType } from "graphql/server-types.gen";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQueryBundle } from "graphql/hooks";
import { GetAllLocationsWithinOrg } from "ui/pages/schools/graphql/get-all-locations.gen";
import { compact } from "lodash-es";

export type VacancyDetailsFormData = {
  positionTypeId?: string;
  contractId?: string;
  locationId?: string;
  bellScheduleId?: string;
  notesToApprover?: string;
  notesToReplacement?: string;
};

type Props = {
  orgId: string;
  positionTypes: PositionType[];
  values: VacancyDetailsFormData;
};

export const VacancyDetailSection: React.FC<Props> = props => {
  const { values, positionTypes, orgId } = props;
  const { t } = useTranslation();

  const getLocations = useQueryBundle(GetAllLocationsWithinOrg, {
    variables: { orgId: orgId },
  });

  const locations: any =
    getLocations.state === "LOADING"
      ? []
      : compact(getLocations?.data?.location?.all ?? []);

  const positionTypeOptions = useMemo(
    () => positionTypes.map((r: any) => ({ label: r.name, value: r.id })),
    [positionTypes]
  );

  const locationOptions = useMemo(
    () => locations.map((r: any) => ({ label: r.name, value: r.id })),
    [locations]
  );

  const bellScheduleOptions = useMemo(
    () =>
      values.locationId !== ""
        ? locations
            .find((l: any) => l.id === values.locationId)
            .workDaySchedules.map((r: any) => ({
              label: r.name,
              value: r.id,
            })) ?? []
        : [],
    [locations]
  );

  if (getLocations.state === "LOADING") {
    return <></>;
  }

  return (
    <>
      <Select
        value={{
          value: values.positionTypeId ?? "",
          label:
            positionTypeOptions.find(a => a.value === values.positionTypeId)
              ?.label || "",
        }}
        options={positionTypeOptions}
        multiple={false}
        label={t("Position type")}
      ></Select>

      <Select
        value={{
          value: values.locationId ?? "",
          label:
            locationOptions.find((a: any) => a.value === values.positionTypeId)
              ?.label || "",
        }}
        options={locationOptions}
        multiple={false}
        label={t("Location")}
      ></Select>

      <Select
        value={{
          value: values.bellScheduleId ?? "",
          label:
            bellScheduleOptions.find(
              (a: any) => a.value === values.bellScheduleId
            )?.label || "",
        }}
        options={bellScheduleOptions}
        multiple={false}
        label={t("Bell Schedule")}
      ></Select>
    </>
  );
};
