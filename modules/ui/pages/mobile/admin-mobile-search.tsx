import * as React from "react";
import { MobileSearchBar } from "ui/app-chrome/mobile-navigation/mobile-search";

type Props = {};

export const AdminMobileSearchPage: React.FC<Props> = props => {
  return (
    <>
      <MobileSearchBar role="admin" />
    </>
  );
};
