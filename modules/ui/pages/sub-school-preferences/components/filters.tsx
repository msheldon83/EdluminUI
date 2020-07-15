import * as React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "ui/components/form/input";
import { TextField } from "@material-ui/core";
import { compact } from "lodash-es";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetUserById } from "../graphql/get-user-by-id.gen";
import { IsoSelectOne, IsoOptionType } from "ui/components/form/iso-select";

type Props = {
  userId: string;
  orgId: string;
  setOrgId: (id: string) => void;
  orgUserId: string;
  setOrgUserId: (id: string) => void;
  search: string;
  setSearch: (id: string) => void;
};

export const Filters: React.FC<Props> = ({
  userId,
  orgId,
  setOrgId,
  orgUserId,
  setOrgUserId,
  search,
  setSearch,
}) => {
  const { t } = useTranslation();
  const getUser = useQueryBundle(GetUserById, {
    variables: { id: userId },
  });
  const orgOptions: IsoOptionType<[string, string]>[] = [
    { value: ["", ""] as [string, string], label: "Select a district" },
  ].concat(
    getUser.state === "LOADING"
      ? []
      : compact(getUser?.data?.user?.byId?.allOrgUsers ?? [])
          .filter(ou => ou.isReplacementEmployee)
          .map(ou => ({
            value: [ou.organization.id, ou.id],
            label: ou.organization.name,
          }))
  );

  return (
    <>
      <IsoSelectOne
        options={orgOptions}
        value={[orgId, orgUserId]}
        iso={{
          to: (s: string) => s.split(",") as [string, string],
          from: (t: [string, string]) => t.join(","),
        }}
        onChange={([oId, oUId]) => {
          setOrgId(oId);
          setOrgUserId(oUId);
        }}
      />
      <Input
        value={search}
        InputComponent={TextField}
        inputComponentProps={{
          placeholder: `search`,
        }}
        onChange={event => setSearch(event.target.value)}
      />
    </>
  );
};
