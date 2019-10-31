import * as React from "react";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import EmojiObjectsOutlinedIcon from "@material-ui/icons/EmojiObjectsOutlined";
import { useTranslation } from "react-i18next";

type Props = { className?: string; titleClassName?: string };
export const EdluminLogo: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Grid
      container
      className={`${classes.container} ${props.className}`}
      alignItems="center"
      wrap="nowrap"
    >
      <EmojiObjectsOutlinedIcon fontSize="large" className={classes.logo} />
      <Typography
        display="inline"
        variant={"h5"}
        className={`${classes.productTitle} ${props.titleClassName}`}
      >
        {t("Edlumin")}
      </Typography>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(0, 2),
    ...theme.mixins.toolbar,
  },
  logo: {
    color: theme.customColors.marigold,
  },
  productTitle: {
    color: theme.customColors.white,
    fontWeight: 600,
    marginLeft: theme.spacing(1),
    fontFamily: "Poppins",
  },
}));
