import { makeStyles } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { DateDetail } from "./types";

type Props = {
  detail: DateDetail;
};

export const DateDetailItem: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { detail } = props;

  const accountingCodeDisplayName = detail.accountingCodeAllocations ?
    detail.accountingCodeAllocations[0]?.accountingCodeName ?? "" : "";

  return (
    <div>
      <div>
        <div>
          {detail.startTime} {detail.endTime}
        </div>
        <div>{detail.locationName}</div>
      </div>
      <div>
        <div>{detail.payCodeName}</div>
        <div>{accountingCodeDisplayName}</div>
      </div>
    </div>
  );
};

export const useStyles = makeStyles(theme => ({}));
