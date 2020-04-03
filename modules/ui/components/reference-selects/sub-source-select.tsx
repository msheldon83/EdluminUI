import * as React from "react";
import { SelectNew } from "ui/components/form/select-new";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useOrganizationRelationships } from "reference-data/organization-relationships";
import { OrganizationRelationshipType } from "graphql/server-types.gen";

type Props = {
  orgId: string;
  selectedSubSource?: string | null;
  setSelectedSubSource: (orgId?: string | null) => void;
  includeAllAndMyOptions?: boolean;
  showLabel?: boolean;
};

export const SubSourceSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    setSelectedSubSource,
    selectedSubSource,
    includeAllAndMyOptions = true,
    showLabel = true,
  } = props;

  const subSources = useOrganizationRelationships(orgId);

  const subSourceOptions = useMemo(() => {
    const delgateTo = subSources.filter(
      l => l.relationshipType === OrganizationRelationshipType.DelegatesTo
    );
    const options =
      delgateTo?.map(x => ({
        label: x.relatesToOrganization!.name,
        value: x.relatesToOrganization!.id,
      })) ?? [];

    if (includeAllAndMyOptions) {
      options.unshift(
        { label: "(All)", value: "0" },
        { label: "My Organization", value: orgId }
      );
    }

    return options;
  }, [includeAllAndMyOptions, orgId, subSources]);

  const selectedValue = subSourceOptions.find(e =>
    selectedSubSource === "" || selectedSubSource === undefined
      ? subSourceOptions.find(e => e.value.toString() === "0")
      : e.label && selectedSubSource === e.value.toString()
  );

  return (
    <SelectNew
      label={showLabel ? t("Substitute source") : undefined}
      value={selectedValue}
      multiple={false}
      options={subSourceOptions}
      withResetValue={false}
      doSort={false}
      onChange={e => {
        if (e.value.toString() === "0") {
          setSelectedSubSource(undefined);
        } else {
          setSelectedSubSource(e.value.toString());
        }
      }}
    />
  );
};
