import * as React from "react";
import { SelectNew } from "ui/components/form/select-new";
import { useTranslation } from "react-i18next";
import { InvitationStatus } from "graphql/server-types.gen";

type Props = {
  selectedInvitationStatus: InvitationStatus;
  setSelectedInvitationStatus: (invitationStatus: InvitationStatus) => void;
};

export const InvitationStatusSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const { setSelectedInvitationStatus, selectedInvitationStatus } = props;

  const options = [
    { value: InvitationStatus.All, label: t("(All)") },
    { value: InvitationStatus.AccountSetup, label: t("Account set up") },
    { value: InvitationStatus.InviteSent, label: t("Invite sent") },
    { value: InvitationStatus.InviteNotSent, label: t("Invite not sent") },
  ];

  const selectedOption =
    options.find((is: any) => is.value === selectedInvitationStatus) ??
    options[0];

  return (
    <SelectNew
      label={t("Invitation status")}
      value={selectedOption}
      multiple={false}
      options={options}
      withResetValue={false}
      onChange={e => {
        setSelectedInvitationStatus(e.value as InvitationStatus);
      }}
      doSort={false}
    />
  );
};
