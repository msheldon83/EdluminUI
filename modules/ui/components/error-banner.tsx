import * as React from "react";
import { Grid, makeStyles } from "@material-ui/core";
import { ApolloError } from "apollo-client";
import { Button } from "@material-ui/core";
import { TFunction } from "i18next";
import { TranslateAbsenceErrorCodeToMessage } from "ui/components/absence/helpers";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "ui/components/section-header";
import { compact, uniq } from "lodash-es";

type Props = {
  apolloErrors: ApolloError | null;
  errorBannerOpen: boolean;
  title: string;
  warningsOnlyTitle: string;
  onClose: () => void;
  continueAction: () => Promise<void>;
  translateCodeToMessage?: (
    errorCode: string,
    t: TFunction
  ) => string | undefined;
};

export const ErrorBanner: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const warnings =
    props.apolloErrors?.graphQLErrors.filter(
      e => e.extensions?.data?.severity === "Warn"
    ) ?? [];
  const warningsOnly =
    warnings.length === props.apolloErrors?.graphQLErrors.length;

  const messages = uniq(
    compact(
      props.apolloErrors?.graphQLErrors.map((e, i) => {
        const errorMessage = props.translateCodeToMessage
          ? TranslateAbsenceErrorCodeToMessage(e.extensions?.data?.code, t) ??
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

  return (
    <>
      {props.errorBannerOpen && (
        <div>
          <Grid container>
            <Grid item xs={12}>
              <SectionHeader
                title={warningsOnly ? props.warningsOnlyTitle : props.title}
                className={classes.header}
              />
              {messages?.map((m, i) => (
                <div key={i} className={classes.message}>
                  {m}
                </div>
              ))}
              <div className={classes.padding}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => props.onClose()}
                >
                  {warningsOnly ? t("Cancel") : t("Ok")}
                </Button>
                {warningsOnly && (
                  <Button
                    size="small"
                    variant="contained"
                    className={classes.buttonPadding}
                    onClick={async () => {
                      props.onClose();
                      await props.continueAction();
                    }}
                  >
                    {t("Ignore & Continue")}
                  </Button>
                )}
              </div>
            </Grid>
          </Grid>
          <hr></hr>
        </div>
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    color: theme.customColors.darkRed,
  },
  message: {
    wordWrap: "break-word",
    paddingBottom: "4px",
    paddingTop: "4px",
  },
  buttonPadding: {
    marginLeft: "15px",
  },
  padding: {
    paddingTop: "10px",
    paddingBottom: "10px",
  },
}));
