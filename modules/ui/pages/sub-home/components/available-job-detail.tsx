import { useIsMobile } from "hooks";
import * as React from "react";
import {
  AvailableJobDetailUI,
  MobileAvailableJobDetailUI,
} from "./available-job-details-ui";

type Props = {
  locationName: string;
  payInfoLabel: string;
  startTimeLocal: string;
  endTimeLocal: string;
  dayPortion: number;
  shadeRow: boolean;
  viewingAsAdmin?: boolean;
};

export const AvailableJobDetail: React.FC<Props> = props => {
  const isMobile = useIsMobile();

  return isMobile ? (
    <MobileAvailableJobDetailUI {...props} />
  ) : (
    <AvailableJobDetailUI {...props} />
  );
};
