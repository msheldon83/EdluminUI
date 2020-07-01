type FullName = { firstName?: string; lastName?: string };

const nameSort = (n1?: string, n2?: string): number => {
  if (!n1 && !n2) return 0;
  if (!n2) return -1;
  if (!n1) return 1;
  return n1.localeCompare(n2);
};

export const fullNameSort = (n1: FullName, n2: FullName): number => {
  const lastNameSort = nameSort(n1.lastName, n2.lastName);
  return lastNameSort == 0
    ? nameSort(n1.firstName, n2.firstName)
    : lastNameSort;
};
