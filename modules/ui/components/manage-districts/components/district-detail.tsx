import * as React from "react";
import {
  OrgUserRelationshipAttribute,
  Maybe,
  Endorsement,
} from "graphql/server-types.gen";
import { DatePicker } from "ui/components/form/date-picker";

type Props = {
  onRemoveEndorsement: (endorsementId: string) => Promise<unknown>;
  onChangeEndorsement: (
    endorsementId: string,
    expirationDate: Date
  ) => Promise<unknown>;
  endorsement:
    | { name: string; validUntil?: Date | null; id: string }
    | undefined
    | null;
};

export const DistrictDetail: React.FC<Props> = props => {
  const { onRemoveEndorsement, onChangeEndorsement, endorsement } = props;

  //Date Picker with verify onChange... if successful, write change to DB.
  //Trash can icon for remove
  return (
    <>
      <div>{endorsement?.name}</div>
      <div>{endorsement?.validUntil}</div>
      <div>{endorsement?.id}</div>
    </>
  );
};
