import * as React from "react";
import { Select, OptionType } from "ui/components/form/select";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { OrgUserRole } from "graphql/server-types.gen";
import { useOrgUserOptions } from "./org-users";

type Props = {
  orgId: string;
  role: OrgUserRole;
  selectedOrgUserIds?: string[];
  setSelectedOrgUserIds: (orgUserIds?: string[]) => void;
  includeAllOption?: boolean;
  label?: string;
  multiple?: boolean;
  disabled?: boolean;
  idsToRemoveFromOptions?: string[];
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
    disabled = false,
  } = props;

  let orgUserOptions = useOrgUserOptions(orgId, role);

  if (includeAllOption) {
    orgUserOptions.unshift({ label: t("(All)"), value: "0" });
  }

  if (props.idsToRemoveFromOptions) {
    orgUserOptions = orgUserOptions.filter(
      x => !props.idsToRemoveFromOptions?.includes(x.value)
    );
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
    <Select
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
      doSort={false}
      disabled={disabled}
    />
  );
};
