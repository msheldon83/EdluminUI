import * as React from "react";
import { BaseLink } from "ui/components/links/base";
import { makeStyles } from "@material-ui/styles";
import { Typography } from "@material-ui/core";
import { useIsMobile } from "hooks";
import { PageTitle } from "../page-title";

type Props = {
  to:
    | string
    | {
        pathname: string;
        hash?: string;
        search?: string;
        state?: any;
      };
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
  return (
    <>
      <div className={classes.headerLink}>
        {subtitle ? (
          <Typography variant="h5">{subtitle}</Typography>
        ) : (
          <PageTitle title={title} />
        )}
        <div className={classes.linkPadding}>
          <BaseLink to={to}>{linkText}</BaseLink>
        </div>
      </div>
      {subtitle && <PageTitle title={title} />}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  headerLink: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  linkPadding: {
    paddingRight: theme.spacing(2),
  },
}));
