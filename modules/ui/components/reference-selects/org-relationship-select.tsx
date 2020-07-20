import * as React from "react";
import { SelectNew } from "ui/components/form/select-new";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useOrganizationRelationships } from "reference-data/organization-relationships";
import { OrganizationRelationshipType } from "graphql/server-types.gen";

type Props = {
  orgId: string;
  selectedOrgId?: string | null;
  setSelectedOrgId: (orgId?: string | null) => void;
  includeAllOption?: boolean;
  includeMyOrgOption?: boolean;
  label?: string;
  multiple?: boolean;
};

export const OrgRelationshipSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    selectedOrgId,
    setSelectedOrgId,
    includeAllOption = true,
    includeMyOrgOption = true,
    label,
  } = props;

  const orgRelationships = useOrganizationRelationships(orgId);

  const orgOptions = useMemo(() => {
    const delgateTo = orgRelationships.filter(
      l => l.relationshipType === OrganizationRelationshipType.DelegatesTo
    );
    const options =
      delgateTo
        ?.map(x => ({
          label: x.relatesToOrganization!.name,
          value: x.relatesToOrganization!.id,
        }))
        .sort((a, b) =>
          a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
        ) ?? [];

    if (includeMyOrgOption) {
      options.unshift({ label: t("My Organization"), value: orgId });
    }

    if (includeAllOption) {
      options.unshift({ label: t("(All)"), value: "0" });
    }

    return options;
  }, [includeAllOption, includeMyOrgOption, orgId, orgRelationships, t]);

  const selectedValue = orgOptions.find(e =>
    selectedOrgId === "" || selectedOrgId === undefined
      ? orgOptions.find(e => e.value.toString() === "0")
      : e.label && selectedOrgId === e.value.toString()
  );

  return (
    <SelectNew
      label={label}
      value={selectedValue ?? { value: "", label: "" }}
      multiple={false}
      options={orgOptions}
      withResetValue={false}
      doSort={false}
      onChange={e => {
        if (e.value.toString() === "0") {
          setSelectedOrgId(undefined);
        } else {
          setSelectedOrgId(e.value.toString());
        }
      }}
    />
  );
};
