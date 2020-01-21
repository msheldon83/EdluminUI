import * as React from "react";
import { SubstitutePool } from "graphql/server-types.gen";

type Props = {
  favoriteHeading: string;
  blockedHeading: string;
  substitutePool: SubstitutePool;
  heading: string;
  subHeading: string;
};

export const SubstitutePreference: React.FC<Props> = props => {
  return <></>;
};
