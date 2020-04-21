import * as React from "react";
import { pickUrl, BaseLink } from "./base";
import { CanDo, OrgUserPermissions, Role } from "ui/components/auth/types";
import { PermissionEnum } from "graphql/server-types.gen";
import { VacancyViewRoute } from "ui/routes/vacancy";
import { canAssignSub } from "helpers/permissions";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";

type GeneralProps = {
  orgId: string;
  state?: any;
  linkClass?: string;
  textClass?: string;
};

type AbsenceProps = GeneralProps & {
  absenceId: string | undefined;
};

// Backticked defaults seem to confuse my syntax highligher,
// so I'm just defining these separately to avoid the headache
const absString = (id?: string) => `#${id}` ?? "";
const vacString = (id?: string) => `#V${id}` ?? "";

export const AbsenceLink: React.FC<AbsenceProps> = ({
  orgId,
  absenceId,
  state,
  children = absString(absenceId),
  ...props
}) => {
  if (absenceId === undefined) {
    return <span className={props.textClass}> {children} </span>;
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
    >
      {children}
    </BaseLink>
  );
};

type VacancyProps = GeneralProps & {
  vacancyId: string | undefined;
};

export const VacancyLink: React.FC<VacancyProps> = ({
  orgId,
  vacancyId,
  state,
  children = vacString(vacancyId),
  ...props
}) => {
  if (vacancyId === undefined) {
    return <span className={props.textClass}> {children} </span>;
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
    >
      {children}
    </BaseLink>
  );
};

type AbsVacProps = GeneralProps & {
  absVacId: string | undefined;
  absVacType: "absence" | "vacancy";
};

export const AbsVacLink: React.FC<AbsVacProps> = ({
  absVacId,
  absVacType,
  ...props
}) =>
  absVacType === "absence" ? (
    <AbsenceLink absenceId={absVacId} {...props} />
  ) : (
    <VacancyLink vacancyId={absVacId} {...props} />
  );

type AbsenceAssignProps = AbsenceProps & {
  absenceDate: Date;
};

export const AbsenceAssignLink: React.FC<AbsenceAssignProps> = ({
  orgId,
  absenceId,
  absenceDate,
  state,
  ...props
}) => {
  if (absenceId === undefined) {
    return <span className={props.textClass}> {props.children} </span>;
  }
  const urlStr = `${AdminEditAbsenceRoute.generate({
    organizationId: orgId,
    absenceId,
  })}?step=preAssignSub`;
  return (
    <BaseLink
      permissions={(
        permissions: OrgUserPermissions[],
        isSysAdmin: boolean,
        orgId?: string,
        forRole?: Role | null | undefined
      ) => canAssignSub(absenceDate, permissions, isSysAdmin, orgId, forRole)}
      to={{ ...pickUrl(urlStr), state: state }}
      displayText={false}
      {...props}
    />
  );
};

type VacancyAssignProps = VacancyProps & {
  vacancyDate: Date;
};

export const VacancyAssignLink: React.FC<VacancyAssignProps> = ({
  orgId,
  vacancyId,
  vacancyDate,
  state,
  ...props
}) => {
  if (vacancyId === undefined) {
    return <span className={props.textClass}> {props.children} </span>;
  }
  const urlStr = `${VacancyViewRoute.generate({
    organizationId: orgId,
    vacancyId,
  })}?step=preAssignSub`;
  return (
    <BaseLink
      permissions={(
        permissions: OrgUserPermissions[],
        isSysAdmin: boolean,
        orgId?: string,
        forRole?: Role | null | undefined
      ) => canAssignSub(vacancyDate, permissions, isSysAdmin, orgId, forRole)}
      to={{ ...pickUrl(urlStr), state: state }}
      displayText={false}
      {...props}
    />
  );
};

type AbsVacAssignProps = AbsVacProps & {
  absVacDate: Date;
};

export const AbsVacAssignLink: React.FC<AbsVacAssignProps> = ({
  absVacId,
  absVacType,
  absVacDate,
  ...props
}) =>
  absVacType === "absence" ? (
    <AbsenceAssignLink
      absenceId={absVacId}
      absenceDate={absVacDate}
      {...props}
    />
  ) : (
    <VacancyAssignLink
      vacancyId={absVacId}
      vacancyDate={absVacDate}
      {...props}
    />
  );
