import * as React from "react";
import { pickUrl, BaseLink } from "./base";
import { CanDo } from "ui/components/auth/types";
import { PermissionEnum } from "graphql/server-types.gen";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";

type Props = {
  orgId: string;
  absenceId: string | undefined;
  state?: any;
  linkClass?: string;
  spanClass?: string;
};

export const AbsenceLink: React.FC<Props> = ({
  orgId,
  absenceId,
  state,
  ...props
}) => {
  if (absenceId === undefined) {
    return <span className={props.spanClass}> {props.children} </span>;
  }
  const urlStr = AdminEditAbsenceRoute.generate({
    organizationId: orgId,
    absenceId: absenceId,
  });
  return (
    <BaseLink
      permissions={[PermissionEnum.AbsVacView]}
      to={{ ...pickUrl(urlStr), state: state }}
      {...props}
    />
  );
};
