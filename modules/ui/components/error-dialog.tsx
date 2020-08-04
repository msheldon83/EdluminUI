import * as React from "react";
import {
  makeStyles,
  DialogTitle,
  DialogContent,
  Dialog,
  Typography,
} from "@material-ui/core";
import { ApolloError } from "apollo-client";
import { Button } from "@material-ui/core";
import { TranslateAbsenceErrorCodeToMessage } from "ui/components/absence/helpers";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "ui/components/section-header";
import { compact, uniq } from "lodash-es";

type Props = {
  apolloErrors: ApolloError | null;
  open: boolean;
  title: string;
  warningsOnlyTitle: string;
  onClose: () => void;
  continueAction: () => Promise<void>;
};

export const ErrorDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    open,
    title,
    warningsOnlyTitle,
    apolloErrors,
    onClose,
    continueAction,
  } = props;

  const warnings =
    apolloErrors?.graphQLErrors.filter(
      e => e.extensions?.data?.severity === "Warn"
    ) ?? [];
  const warningsOnly = warnings.length === apolloErrors?.graphQLErrors.length;

  const messages = uniq(
    compact(
      apolloErrors?.graphQLErrors.map((e, i) => {
        const errorMessage =
          TranslateAbsenceErrorCodeToMessage(e.extensions?.data?.code, t) ??
          e.extensions?.data?.text ??
          e.extensions?.data?.code;
        if (!errorMessage) {
          return null;
        }
        return errorMessage;
      })
    )
  );

  return (
    <Dialog open={open}>
      <DialogTitle>
        <SectionHeader
          title={warningsOnly ? warningsOnlyTitle : title}
          className={classes.header}
        />
      </DialogTitle>
      <DialogContent>
        {messages?.map((m, i) => (
          <div key={i} className={classes.message}>
            {m}
          </div>
        ))}
        <div className={classes.actions}>
          <Button size="small" variant="outlined" onClick={() => onClose()}>
            {warningsOnly ? t("Cancel") : t("Okay")}
          </Button>
          {warningsOnly && (
            <Button
              size="small"
              variant="contained"
              className={classes.buttonPadding}
              onClick={async () => {
                onClose();
                await continueAction();
              }}
            >
              {t("Ignore & Continue")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: 0,
  },
  message: {
    wordWrap: "break-word",
    paddingBottom: theme.spacing(2),
  },
  buttonPadding: {
    marginLeft: theme.spacing(2),
  },
  actions: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    width: "100%",
    textAlign: "right",
  },
}));
