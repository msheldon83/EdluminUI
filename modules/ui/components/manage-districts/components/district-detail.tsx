import * as React from "react";
import { OrgUserRelationshipAttribute, Maybe } from "graphql/server-types.gen";
import { DatePicker } from "ui/components/form/date-picker";

type Props = {
  onRemoveEndorsement: (endorsementId: string) => Promise<unknown>;
  onChangeEndorsement: (
    endorsementId: string,
    expirationDate: Date
  ) => Promise<unknown>;
  endorsement: Maybe<
    Pick<OrgUserRelationshipAttribute, "endorsementId" | "expires" | "name">
  >;
};

export const DistrictDetail: React.FC<Props> = props => {
  const { onRemoveEndorsement, onChangeEndorsement, endorsement } = props;

  //Date Picker with verify onChange... if successful, write change to DB.
  //Trash can icon for remove
  return (
    <>
      <div>{endorsement?.name}</div>
      <div>{endorsement?.expires}</div>
      <div>{endorsement?.endorsementId}</div>
    </>
  );
};
