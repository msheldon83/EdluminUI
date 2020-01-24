import * as React from "react";
import { useMemo, useState, useCallback, useContext, useEffect } from "react";
import { useScreenSize } from "hooks";
import { compact } from "lodash-es";
import { useQueryBundle } from "graphql/hooks";
import { GetOrganizationName } from "./organization-switcher-bar/GetOrganizationName.gen";

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

  const org = useQueryBundle(GetOrganizationName, {
    variables: { id: organizationId },
    fetchPolicy: "cache-only",
    skip: !organizationId,
  });
  const organizationName =
    org.state === "DONE" || org.state === "UPDATING"
      ? org.data.organization?.byId?.name
      : "";
  useEffect(() => {
    document.title = compact([title, organizationName, "RedRover"]).join(" - ");
  }, [title, organizationName]);

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
