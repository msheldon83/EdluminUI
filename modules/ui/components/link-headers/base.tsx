import * as React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import { Typography } from "@material-ui/core";
import { useIsMobile } from "hooks";
import { PageTitle } from "../page-title";

type Props = {
  to: string;
  linkText: string;
  title: string;
  subtitle?: string;
};

export const LinkHeader: React.FC<Props> = ({
  to,
  linkText,
  title,
  subtitle,
}) => {
  const classes = useStyles();
  const isMobile = useIsMobile();
  const Title = <PageTitle title={title} />;
  return (
    <>
      <div className={classes.headerLink}>
        {subtitle ? <Typography variant="h5">{subtitle}</Typography> : Title}
        <div className={classes.linkPadding}>
          <Link to={to} className={classes.link}>
            {linkText}
          </Link>
        </div>
      </div>
      {subtitle && Title}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  headerLink: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  link: {
    color: theme.customColors.blue,
    "&:visited": {
      color: theme.customColors.blue,
    },
  },
  linkPadding: {
    paddingRight: theme.spacing(2),
  },
}));
