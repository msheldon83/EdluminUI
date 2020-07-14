import * as React from "react";
import { SelectNew } from "ui/components/form/select-new";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useOrgUserOrgRelationships } from "reference-data/org-user-org-relationships";
import { OrganizationRelationshipType } from "graphql/server-types.gen";

type Props = {
  staffingOrgId: string;
  userId: string;
  selectedOrgId?: string | null;
  setSelectedOrgId: (orgId?: string | null) => void;
  includeAllOption?: boolean;
  includeMyOrgOption?: boolean;
  label?: string;
  multiple?: boolean;
};

//Returns elidigble Org's the User is a Shadow of.
export const OrgUserOrgRelationshipSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    selectedOrgId,
    setSelectedOrgId,
    includeAllOption = true,
    includeMyOrgOption = true,
    staffingOrgId,
    userId,
    label,
  } = props;

  //These component will render the orgUserOrganizationRelationships query and return all elidgible
  //Orgs that the User is a part of

  const orgRelationships = useOrgUserOrgRelationships(userId, staffingOrgId);

  const orgOptions = useMemo(() => {
    const delgateTo = orgRelationships.filter(
      l => l.relationshipType === OrganizationRelationshipType.Services
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
      options.unshift({ label: t("My Organization"), value: staffingOrgId });
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
