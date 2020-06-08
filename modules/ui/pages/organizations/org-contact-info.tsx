import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { useMyUserAccess } from "reference-data/my-user-access";
import { makeStyles } from "@material-ui/styles";
import { OrganizationContactCard } from "./components/organization-contact-card";
import { GetOrganizationContactsByUserId } from "ui/pages/organizations/graphql/get-organization-contacts.gen";
import { sortBy } from "lodash-es";

export const OrganicationContactInfo: React.FC<{}> = props => {
  const classes = useStyles();
  const myUserAccess = useMyUserAccess();
  const user = myUserAccess?.me?.user;
  const { t } = useTranslation();

  const getOrganizationContacts = useQueryBundle(
    GetOrganizationContactsByUserId,
    {
      variables: { id: user?.id },
    }
  );

  if (getOrganizationContacts.state === "LOADING") {
    return <></>;
  }

  const organizationContacts =
    getOrganizationContacts?.data.user?.byId?.orgUsers;

  const sortedOrganizations = sortBy(
    organizationContacts,
    o => o?.organization.name
  );

  return (
    <>
      <div>
        <Typography className={classes.title} variant="h5">
          {t("Help")}
        </Typography>
        <PageTitle title={t("District Contacts")} />
      </div>
      <Section>
        {sortedOrganizations?.map((e, i) => (
          <OrganizationContactCard
            key={i}
            organizationName={e!.organization.name}
            isEmployee={e?.isEmployee ?? false}
            isReplacementEmployee={e?.isReplacementEmployee ?? false}
            subContact={e?.organization.config?.absenceSubContact}
            employeeContact={e?.organization.config?.absenceEmployeeContact}
          />
        ))}
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  title: {
    color: theme.customColors.primary,
  },
}));
