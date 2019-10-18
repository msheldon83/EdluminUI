import * as React from "react";
import { useMemo, useState, useCallback, useContext } from "react";
import { useScreenSize } from "hooks";

type PageTitleContext = {
  showIn: "menu-bar" | "page-content";
  title?: string;
  supplyTitle: (title: string) => () => void;
};

const PageTitleContext = React.createContext<PageTitleContext>({
  showIn: "page-content",
  supplyTitle: () => () => {},
});

type PageTitleState = {};
export const PageTitleProvider: React.FC<{}> = props => {
  const screenSize = useScreenSize();
  const [title, setTitle] = useState<string | undefined>(undefined);
  /*
  the logic for supplyTitle might have race conditions.
  probably unlikely to encounter in normal use?
  */
  const supplyTitle = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      return () => {
        setTitle(currentTitle => {
          if (newTitle === currentTitle) {
            return undefined;
          }
          return currentTitle;
        });
      };
    },
    [setTitle]
  );
  const ctx: PageTitleContext = useMemo(
    () => ({
      showIn: screenSize === "mobile" ? "menu-bar" : "page-content",
      supplyTitle,
      title,
    }),
    [screenSize, supplyTitle, title]
  );
  return (
    <PageTitleContext.Provider value={ctx}>
      {props.children}
    </PageTitleContext.Provider>
  );
};
export const usePageTitleContext = () => useContext(PageTitleContext);
