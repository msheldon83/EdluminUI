import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

// List
export const DataImportRoute = defineSubRoute(AdminChromeRoute, "/data-import");

export const DataImportLoader = asyncComponent({
  resolve: async () => {
    const DataImportPage = (await import("ui/pages/data-import"))
      .DataImportPage;
    return DataImportPage;
  },
  name: "DataImportPage",
});

// View/Edit
export const DataImportViewRoute = defineSubRoute(
  DataImportRoute,
  "/:dataImportId",
  ["dataImportId"]
);

export const DataImportViewLoader = asyncComponent({
  resolve: async () => {
    const DataImportViewPage = (await import("ui/pages/data-import/view"))
      .DataImportViewPage;
    return DataImportViewPage;
  },
  name: "DataImportViewPage",
});
