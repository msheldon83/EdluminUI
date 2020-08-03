export type GroupedAbsenceReason = {
  id: string;
  externalId?: string | null;
  name: string;
  isCategory?: boolean | null;
  absenceReasonTrackingTypeId?: string | null;
  code?: string | null;
  allowNegativeBalance?: boolean | null;
  rowVersion: string;
  isRestricted: boolean;
  requiresApproval: boolean;
};

export type GroupedCategory = {
  id: string;
  externalId?: string | null;
  name: string;
  isCategory?: boolean | null;
  trackingType?: string | null;
  allowNegativeBalance?: boolean | null;
  rowVersion: string;
  children?: GroupedAbsenceReason[] | null;
};
