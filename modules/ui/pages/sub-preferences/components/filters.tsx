import * as React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "ui/components/form/input";
import { Grid, makeStyles } from "@material-ui/core";
import { compact } from "lodash-es";
import { useQueryBundle } from "graphql/hooks";
import { GetUserById } from "../graphql/get-user-by-id.gen";
import { useIsMobile } from "hooks";
import { IsoSelectOne, IsoOptionType } from "ui/components/form/iso-select";

type Props = {
  userId: string;
  orgId: string;
  setOrgId: (id: string) => void;
  orgName: string;
  setOrgName: (id: string) => void;
  orgUserId: string;
  setOrgUserId: (id: string) => void;
  search: string;
  setSearch: (id: string) => void;
};

export const Filters: React.FC<Props> = ({
  userId,
  orgId,
  setOrgId,
  orgName,
  setOrgName,
  orgUserId,
  setOrgUserId,
  search,
  setSearch,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

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
    <Grid container>
      <Grid
        item
        xs={isMobile ? 12 : 3}
        className={isMobile ? classes.mobileTopFilter : classes.filter}
      >
        <IsoSelectOne
          label={t("District")}
          options={orgOptions}
          value={[orgId, orgUserId]}
          iso={{
            to: (s: string) => s.split(",") as [string, string],
            from: (t: [string, string]) => t.join(","),
          }}
          onChange={({ value: [oId, oUId], label: oName }) => {
            setOrgId(oId);
            setOrgName(oName);
            setOrgUserId(oUId);
          }}
        />
      </Grid>
      <Grid
        item
        xs={isMobile ? 12 : 3}
        className={isMobile ? classes.mobileBottomFilter : classes.filter}
      >
        <Input
          label={t("Schools")}
          placeholder={t("Search")}
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  filter: {
    padding: theme.spacing(3),
    paddingLeft: 0,
  },
  mobileTopFilter: {
    paddingBottom: theme.spacing(2),
  },
  mobileBottomFilter: {
    paddingBottom: theme.spacing(3),
  },
}));
