import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Input } from "ui/components/form/input";
import { Section } from "ui/components/section";
import { useDeferredState } from "hooks";
import { useCallback, useEffect } from "react";
import { SectionHeader } from "ui/components/section-header";

type Props = {
  attributes: Attribute[];
  remove?: void;
};

export type Attribute = {
  id: string;
  name: string;
};

export const AvailableAttributes: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [
    searchText,
    pendingSearchText,
    setPendingSearchText,
  ] = useDeferredState<string | undefined>(undefined, 200);
  useEffect(() => {
    // props.setSearchText(searchText);
  }, [searchText]);

  const updateSearchText = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingSearchText(event.target.value);
    },
    [setPendingSearchText]
  );

  return (
    <>
      <Grid item xs={12}>
        <Section>
          <SectionHeader title={t("Available Attributes")} />
          <Grid item xs={12} sm={6} md={6} lg={6}>
            <Input
              label={t("Attributes")}
              value={pendingSearchText}
              onChange={updateSearchText}
              placeholder={t("Search")}
              className={classes.label}
            />
          </Grid>
          <div className={classes.fontColorGrey}>Add selected to:</div>

          <hr />
          <Grid item xs={12} sm={6} lg={6}>
            {props.attributes?.length === 0 ? (
              <div>{t("Not defined")}</div>
            ) : (
              props.attributes?.map((n, i) => <div key={i}>{n?.name}</div>)
            )}
          </Grid>
          <hr />
        </Section>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  label: {
    fontWeight: 500,
    marginBottom: theme.typography.pxToRem(4),
  },
  fontColorGrey: {
    color: theme.customColors.appBackgroundGray,
  },
}));
