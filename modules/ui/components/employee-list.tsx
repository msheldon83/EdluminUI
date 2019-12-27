import { makeStyles, useTheme } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";

type Props = {
  headerTitle: string;
  peopleList: { id: string; name: string }[];
  onRemove: (data: any) => Promise<void>;
};

// Used for Sub Pool & Sub Preference Edit Pages
export const SubPools: React.FC<Props> = props => {
  const { t } = useTranslation();
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useIsMobile();

  return (
    <>
      <PageTitle title={t("Substitute pools")} />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
