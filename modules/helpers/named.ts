import { FC } from "react";
export const named: <Props>(name: string, fc: FC<Props>) => FC<Props> = (
  name,
  fc
) => {
  fc.displayName = name;
  return fc;
};
