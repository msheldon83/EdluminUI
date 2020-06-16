import * as React from "react";
import { SelectNew } from "ui/components/form/select-new";
import { useTranslation } from "react-i18next";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { useAllSchoolYearOptions } from "reference-data/school-years";
import { useEffect } from "react";

type Props = {
  orgId: string;
  selectedSchoolYearId?: string;
  setSelectedSchoolYearId: (schoolYearId?: string) => void;
  defaultToCurrentSchoolYear?: boolean;
  showLabel?: boolean;
  label?: string;
};

export const SchoolYearSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    setSelectedSchoolYearId,
    selectedSchoolYearId,
    defaultToCurrentSchoolYear = true,
    showLabel = true,
    label = t("School Year"),
  } = props;

  const schoolYearOptions = useAllSchoolYearOptions(orgId);
  const currentSchoolYear = useCurrentSchoolYear(orgId);

  useEffect(() => {
    if (defaultToCurrentSchoolYear) {
      setSelectedSchoolYearId(currentSchoolYear?.id);
    }
  }, [currentSchoolYear, defaultToCurrentSchoolYear]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedSchoolYear = schoolYearOptions.find(
    (sy: any) => sy.value === selectedSchoolYearId
  ) ?? { value: "", label: "" };

  return (
    <SelectNew
      label={showLabel ? label : undefined}
      value={selectedSchoolYear}
      multiple={false}
      options={schoolYearOptions}
      withResetValue={false}
      onChange={e => {
        setSelectedSchoolYearId(e.value.toString());
      }}
    />
  );
};
