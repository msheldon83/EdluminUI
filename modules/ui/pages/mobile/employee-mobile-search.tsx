import * as React from "react";
import { MobileSearchBar } from "ui/app-chrome/mobile-navigation/mobile-search";

type Props = {};
export const EmployeeMobileSearchPage: React.FC<Props> = props => {
  return (
    <>
      <MobileSearchBar role="employee" />
    </>
  );
};
