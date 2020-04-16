import * as React from "react";
import { pickUrl, BaseLink } from "./base";
import { CanDo } from "ui/components/auth/types";
import { PermissionEnum } from "graphql/server-types.gen";
import { VacancyViewRoute } from "ui/routes/vacancy";

type Props = {
  orgId: string;
  vacancyId: string | undefined;
  state?: any;
  linkClass?: string;
  spanClass?: string;
};

export const VacancyLink: React.FC<Props> = ({
  orgId,
  vacancyId,
  state,
  ...props
}) => {
  if (vacancyId === undefined) {
    return <span className={props.spanClass}> {props.children} </span>;
  }
  const urlStr = VacancyViewRoute.generate({
    organizationId: orgId,
    vacancyId,
  });
  return (
    <BaseLink
      permissions={[PermissionEnum.AbsVacView]}
      to={{ ...pickUrl(urlStr), state: state }}
      {...props}
    />
  );
};
