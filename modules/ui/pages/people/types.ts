export type TablePerson = {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  userName?: string;
  externalId: string;
  roles: string;
  positionType?: string;
  phoneNumber?: string;
  locations?: { name: string; id: string }[];
  endorsements?: { name: string; id: string }[];
  adminLocations?: { name: string; id: string }[];
  allLocationIdsInScope: boolean;
  adminPositionTypes?: { name: string; id: string }[];
  allPositionTypeIdsInScope: boolean;
  inviteSent: boolean;
  inviteSentAtUtc?: Date;
  invitationRequestedAtUtc?: Date;
  accountSetup: boolean;
  isSuperUser: boolean;
  isShadowRecord: boolean;
  shadowFromOrgName?: string;
};
