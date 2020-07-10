import * as React from "react";
import { RenderFunctionsType, OpenDialogOptions } from "hooks/use-dialog";
import { ApolloError } from "apollo-client";
import { Button } from "@material-ui/core";
import { TFunction } from "i18next";
import { SnackbarHookType } from "hooks/use-snackbar";
import { compact, uniq } from "lodash-es";

export const ShowIgnoreAndContinueOrError = (
  error: ApolloError,
  openDialog: (options: OpenDialogOptions) => void,
  title: string,
  warningsOnlyTitle: string,
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
    title: warningsOnly ? warningsOnlyTitle : title,
    renderContent() {
      const messages = uniq(
        compact(
          error.graphQLErrors.map((e, i) => {
            const errorMessage = translateCodeToMessage
              ? translateCodeToMessage(e.extensions?.data?.code, t) ??
                e.extensions?.data?.text ??
                e.extensions?.data?.code
              : e.extensions?.data?.text ?? e.extensions?.data?.code;
            if (!errorMessage) {
              return null;
            }
            return errorMessage;
          })
        )
      );
      return messages.map((m, i) => <div key={i}>{m}</div>);
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
  const messages = uniq(
    compact(
      error.graphQLErrors.map((e, i) => {
        const errorMessage =
          e.extensions?.data?.text ?? e.extensions?.data?.code;
        if (!errorMessage) {
          return null;
        }
        return errorMessage[errorMessage.length - 1] === "."
          ? errorMessage
          : `${errorMessage}.`;
      })
    )
  );

  openSnackbar({
    message: messages.map((m, i) => <div key={i}>{m}</div>),
    dismissable: true,
    status: "error",
  });
};

export const ConvertApolloErrors = (error: ApolloError) => {
  const messages = uniq(
    compact(
      error.graphQLErrors.map((e, i) => {
        const errorMessage =
          e.extensions?.data?.text ?? e.extensions?.data?.code;
        if (!errorMessage) {
          return null;
        }
        return errorMessage[errorMessage.length - 1] === "."
          ? errorMessage
          : `${errorMessage}.`;
      })
    )
  );

  return messages.join(", ");
};

export const ShowNetworkErrors = (
  error: ApolloError,
  openSnackbar: (snackbarConfig: SnackbarHookType) => void
) => {
  const message = error.networkError?.message;

  openSnackbar({
    message: <div>{message}</div>,
    dismissable: true,
    status: "error",
  });
};

//Used for handling Yup errors
export const ShowGenericErrors = (
  error: { errors: string[] },
  openSnackbar: (snackbarConfig: SnackbarHookType) => void
) => {
  const messages = uniq(compact(error.errors));
  openSnackbar({
    message: messages.map((m, i) => <div key={i}>{m}</div>),
    dismissable: true,
    autoHideDuration: 5000,
    status: "error",
  });
};
