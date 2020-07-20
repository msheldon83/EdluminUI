import * as React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "ui/components/form/input";
import { Grid, makeStyles } from "@material-ui/core";
import { compact } from "lodash-es";
import { useQueryBundle } from "graphql/hooks";
import { useMyUserAccess } from "reference-data/my-user-access";
import { useIsMobile } from "hooks";
import { IsoSelectOne, IsoOptionType } from "ui/components/form/iso-select";

type Props = {
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

  const user = useMyUserAccess()?.me?.user;
  const orgOptions: IsoOptionType<[string, string]>[] = compact(
    user?.orgUsers ?? []
  )
    .filter(ou => ou.isReplacementEmployee)
    .map(ou => ({
      value: [ou.organization.id, ou.id],
      label: ou.organization.name,
    }));
  React.useEffect(() => {
    if (orgOptions.length == 1) {
      const {
        value: [orgId, orgUserId],
        label: orgName,
      } = orgOptions[0];
      setOrgId(orgId);
      setOrgName(orgName);
      setOrgUserId(orgUserId);
    }
  }, [orgOptions, setOrgId, setOrgName, setOrgUserId]);

  return (
    <Grid container>
      {orgOptions.length !== 1 && (
        <Grid
          item
          xs={isMobile ? 12 : 3}
          className={isMobile ? classes.mobileTopFilter : classes.filter}
        >
          <IsoSelectOne
            label={t("District")}
            options={[
              {
                value: ["", ""] as [string, string],
                label: "Select a district",
              },
            ].concat(orgOptions)}
            value={[orgId, orgUserId]}
            iso={{
              to: (s: string) => s.split(",") as [string, string],
              from: (t: [string, string]) => t.join(","),
            }}
            onChange={({ value: [orgId, orgUserId], label: orgName }) => {
              setOrgId(orgId);
              setOrgName(orgName);
              setOrgUserId(orgUserId);
            }}
          />
        </Grid>
      )}
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
