import * as React from "react";
import clsx from "clsx";
import { useLocation } from "react-router-dom";
import { Location } from "history";
import { useTranslation } from "react-i18next";
import { Link, makeStyles } from "@material-ui/core";
import { BaseLink, LinkOptions, pickUrl } from "./base";

// Backticked defaults seem to confuse my syntax highligher,
// so I'm just defining these separately to avoid the headache
const defaultRenderLink = (t: (s: string) => string, comingFrom?: string) =>
  `${t("Return to")} ${comingFrom}`;

type Props = {
  renderLink?: (
    t: (s: string) => string,
    comingFrom?: string
  ) => React.ReactNode;
  defaultComingFrom: string;
  defaultReturnUrl: string;
} & LinkOptions;

export const ReturnLink: React.FC<Props> = ({
  renderLink = defaultRenderLink,
  defaultComingFrom,
  defaultReturnUrl,
  ...props
}) => {
  const location = useLocation();
  const { t } = useTranslation();

  const comingFrom: string = location.state?.comingFrom ?? defaultComingFrom;
  const returnLocation: Location<any> = location.state?.returnLocation ?? {
    ...pickUrl(location.state?.returnUrl ?? defaultReturnUrl),
    state: {},
  };

  return (
    <BaseLink to={returnLocation} {...props}>
      {renderLink(t, comingFrom)}
    </BaseLink>
  );
};
