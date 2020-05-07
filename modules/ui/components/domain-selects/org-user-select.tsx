import * as React from "react";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { OrgUserRole } from "graphql/server-types.gen";
import { useOrgUserOptions } from "./org-users";

type Props = {
  orgId: string;
  role: OrgUserRole;
  selectedOrgUserIds?: string[];
  setSelectedOrgUserIds: (locationIds?: string[]) => void;
  includeAllOption?: boolean;
  label?: string;
  multiple?: boolean;
};

export const OrgUserSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    orgId,
    role,
    label,
    selectedOrgUserIds,
    setSelectedOrgUserIds,
    includeAllOption = true,
    multiple = true,
  } = props;

  let orgUserOptions = useOrgUserOptions(orgId, role);

  if (includeAllOption) {
    orgUserOptions = orgUserOptions.sort((a, b) =>
      a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
    );
    orgUserOptions.unshift({ label: t("(All)"), value: "0" });
  }

  const selectedOrgUsers = orgUserOptions.filter(
    e => e.value && selectedOrgUserIds?.includes(e.value.toString())
  );

  const onChangeOrgUsers = useCallback(
    value => {
      const ids: string[] = value
        ? Array.isArray(value)
          ? value.map((v: OptionType) => v.value)
          : [value.value]
        : [];
      if (ids.includes("0")) {
        setSelectedOrgUserIds(undefined);
      } else {
        setSelectedOrgUserIds(ids);
      }
    },
    [setSelectedOrgUserIds]
  );

  return (
    <SelectNew
      label={label}
      value={
        multiple
          ? selectedOrgUsers
          : selectedOrgUsers[0] ?? { value: "", label: "" }
      }
      multiple={multiple}
      options={orgUserOptions}
      withResetValue={false}
      onChange={onChangeOrgUsers}
      placeholder={
        includeAllOption && selectedOrgUserIds?.length === 0
          ? t("(All)")
          : undefined
      }
      doSort={!includeAllOption}
    />
  );
};
