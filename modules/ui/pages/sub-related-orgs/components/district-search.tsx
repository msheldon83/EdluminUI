import * as React from "react";
import { Input } from "ui/components/form/input";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect } from "react";
import { useDeferredState } from "hooks";

type Props = {
  setSearchText: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const DistrictSearch: React.FC<Props> = props => {
  const { t } = useTranslation();
  const setSearchText = props.setSearchText;

  const [
    searchText,
    pendingSearchText,
    setPendingSearchText,
  ] = useDeferredState<string | undefined>(undefined, 200);
  useEffect(() => {
    setSearchText(searchText);
  }, [setSearchText, searchText]);

  const updateSearchText = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingSearchText(event.target.value);
    },
    [setPendingSearchText]
  );

  return (
    <Input
      label={t("Search")}
      value={pendingSearchText}
      onChange={updateSearchText}
      placeholder={t("District name")}
    />
  );
};
