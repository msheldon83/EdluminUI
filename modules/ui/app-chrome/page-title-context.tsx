import * as React from "react";
import { useMemo, useState, useCallback, useContext, useEffect } from "react";
import { useScreenSize } from "hooks";
import { compact } from "lodash-es";

type PageTitleContext = {
  showIn: "menu-bar" | "page-content";
  title?: string;
  supplyTitle: (title: string) => () => void;
  supplyOrganizationId: (id: string) => () => void;
};

const PageTitleContext = React.createContext<PageTitleContext>({
  showIn: "page-content",
  supplyTitle: () => () => {},
  supplyOrganizationId: () => () => {},
});

export const PageTitleProvider: React.FC<{}> = props => {
  const screenSize = useScreenSize();
  const [title, setTitle] = useState<string>();
  const [organizationId, setOrganizationId] = useState<string>();

  useEffect(() => {
    document.title = compact([title, organizationId, "RedRover"]).join(" - ");
  }, [title, organizationId]);
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
  const supplyOrganizationId = useCallback(
    (organizationId: string) => {
      setOrganizationId(organizationId);
      return () => {
        setOrganizationId(currentOrganizationId => {
          if (organizationId === currentOrganizationId) {
            return undefined;
          }
          return currentOrganizationId;
        });
      };
    },
    [setOrganizationId]
  );

  const ctx: PageTitleContext = useMemo(
    () => ({
      showIn: screenSize === "mobile" ? "menu-bar" : "page-content",
      supplyTitle,
      supplyOrganizationId,
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
