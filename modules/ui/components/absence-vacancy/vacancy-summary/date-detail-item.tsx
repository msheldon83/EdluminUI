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

  const accountingCodeDisplayName = detail.accountingCodeAllocations
    ? detail.accountingCodeAllocations[0]?.accountingCodeName
    : undefined;

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
        {props.readOnly ? (
          <div>
            <LocationLink locationId={detail.locationId} color="black">
              {detail.locationName}
            </LocationLink>
          </div>
        ) : (
          <div>{detail.locationName}</div>
        )}
        {showAccountingCodes && (
          <div>
            {`${t("Acct")}: ${accountingCodeDisplayName ?? ""}`}
            {!accountingCodeDisplayName && (
              <span className={classes.notSpecified}>{t("Not specified")}</span>
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
}));
