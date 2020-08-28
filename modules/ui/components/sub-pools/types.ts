export type PoolMember = {
  employeeId: string;
  employee?: {
    firstName?: string;
    lastName?: string;
  };
};

export type BlockedPoolMember = PoolMember & {
  adminNote?: string;
  // Because we shove incomplete members into lists of these for the ui,
  // we have to make these optional.
  id?: string;
  replacementPoolId?: string;
};

export type PotentialPoolMember = {
  firstName: string;
  lastName: string;
  id: string;
};
