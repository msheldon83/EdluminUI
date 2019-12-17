import * as React from "react";
import { RenderFunctionsType, OpenDialogOptions } from "hooks/use-dialog";
import { ApolloError } from "apollo-client";
import { Button } from "@material-ui/core";
import { TFunction } from "i18next";
import { SnackbarHookType } from "hooks/use-snackbar";

export const ShowIgnoreAndContinueOrError = (
  error: ApolloError,
  openDialog: (options: OpenDialogOptions) => void,
  title: string,
  continueAction: () => Promise<void>,
  t: TFunction,
  translateCodeToMessage?: (
    errorCode: string,
    t: TFunction
  ) => string | undefined
) => {
  const warnings = error.graphQLErrors.filter(
    e => e.extensions?.data?.severity === "Warn"
  );
  const warningsOnly = warnings.length === error.graphQLErrors.length;

  openDialog({
    title: title,
    renderContent() {
      return error.graphQLErrors.map((e, i) => {
        const errorMessage = translateCodeToMessage
          ? translateCodeToMessage(e.extensions?.data?.code, t) ??
            e.extensions?.data?.text ??
            e.extensions?.data?.code
          : e.extensions?.data?.text ?? e.extensions?.data?.code;
        if (!errorMessage) {
          return null;
        }
        return <div key={i}>{errorMessage}</div>;
      });
    },
    renderActions({ closeDialog }: RenderFunctionsType) {
      return (
        <>
          <Button size="small" variant="outlined" onClick={() => closeDialog()}>
            {warningsOnly ? t("Cancel") : t("Okay")}
          </Button>
          {warningsOnly && (
            <Button
              size="small"
              variant="contained"
              onClick={async () => {
                closeDialog();
                await continueAction();
              }}
            >
              {t("Ignore & Continue")}
            </Button>
          )}
        </>
      );
    },
  });
};

export const ShowErrors = (
  error: ApolloError,
  openSnackbar: (snackbarConfig: SnackbarHookType) => void
) => {
  openSnackbar({
    message: error.graphQLErrors.map((e, i) => {
      const errorMessage = e.extensions?.data?.text ?? e.extensions?.data?.code;
      if (!errorMessage) {
        return null;
      }
      return <div key={i}>{errorMessage}</div>;
    }),
    dismissable: true,
    status: "error",
  });
};
