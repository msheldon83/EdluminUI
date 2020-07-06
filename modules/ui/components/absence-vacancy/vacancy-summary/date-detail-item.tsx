import { makeStyles } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { DateDetail } from "./types";
import { LocationLink } from "ui/components/links/locations";

type Props = {
  detail: DateDetail;
  showPayCodes: boolean;
  showAccountingCodes: boolean;
  readOnly: boolean;
};

export const DateDetailItem: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { detail, showPayCodes, showAccountingCodes } = props;

  const accountingCodeAllocations = detail.accountingCodeAllocations ?? [];
  const noAccountingCodes = accountingCodeAllocations.length === 0;
  const singleAccountingCode = accountingCodeAllocations.length === 1;

  return (
    <div className={classes.row}>
      <div>
        <div>{`${detail.startTime} - ${detail.endTime}`}</div>
        {showPayCodes && (
          <div>
            {`${t("Pay")}: ${detail.payCodeId ? detail.payCodeName : ""}`}
            {!detail.payCodeId && (
              <span className={classes.notSpecified}>{t("Not specified")}</span>
            )}
          </div>
        )}
      </div>
      <div className={classes.rightColumn}>
        <div>
          <LocationLink
            locationId={detail.locationId}
            color="black"
            disabled={props.readOnly}
          >
            {detail.locationName}
          </LocationLink>
        </div>
        {showAccountingCodes && (
          <div>
            {noAccountingCodes && (
              <>
                {t("Acct")}
                {": "}
                <span className={classes.notSpecified}>
                  {t("Not specified")}
                </span>
              </>
            )}
            {singleAccountingCode && (
              <>
                {`${t("Acct")}: ${accountingCodeAllocations[0]
                  .accountingCodeName ?? ""}`}
              </>
            )}
            {!noAccountingCodes && !singleAccountingCode && (
              <div className={classes.multiAccountingCodes}>
                <div className={classes.multiAccountingCodesLabel}>
                  {t("Acct")}:
                </div>
                <div>
                  {accountingCodeAllocations.map((a, i) => {
                    return (
                      <div key={i}>
                        {a.accountingCodeName} ({Math.floor(a.allocation * 100)}
                        %)
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const useStyles = makeStyles(theme => ({
  row: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
  },
  notSpecified: {
    color: theme.customColors.edluminSubText,
  },
  rightColumn: {
    textAlign: "right",
  },
  multiAccountingCodes: {
    display: "flex",
    justifyContent: "flex-end"
  },
  multiAccountingCodesLabel: {
    paddingRight: theme.spacing(0.5),
  },
}));
