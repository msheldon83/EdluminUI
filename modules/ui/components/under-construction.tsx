import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { useTranslation } from "react-i18next";

export const UnderConstructionHeader: React.FC = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <>
      <h1>{t("Coming soon")}</h1>
      <h2>
        {t(
          "We are currently working on this feature! It will be available soon."
        )}
      </h2>
    </>
  );
};

const useStyles = makeStyles(theme => ({}));
