import * as React from "react";
import { Typography, makeStyles } from "@material-ui/core";
import { usePageTitleContext } from "ui/app-chrome/page-title-context";
import { useEffect } from "react";

type Props = {
  title: string;
  children?: never;
  withoutHeading?: boolean;
};
/**
 * Page Title component.
 * This component exists so that the title can automatically be
 * hoisted into the mobile nav bar, on smaller screen sizes.
 * @param props
 */
export const PageTitle: React.FC<Props> = props => {
  const classes = useStyles();
  const pageTitleContext = usePageTitleContext();
  const supplyTitle = pageTitleContext.supplyTitle;
  useEffect(() => supplyTitle(props.title), [supplyTitle, props.title]);

  if (pageTitleContext.showIn === "page-content" && !props.withoutHeading) {
    return (
      <Typography className={classes.header} variant="h1">
        {pageTitleContext.title || props.title}
      </Typography>
    );
  } else {
    return <></>;
  }
};

const useStyles = makeStyles(theme => ({
  header: {
    letterSpacing: theme.typography.pxToRem(-1.5),
    lineHeight: theme.typography.pxToRem(64),
    marginBottom: theme.spacing(3),
  },
}));
