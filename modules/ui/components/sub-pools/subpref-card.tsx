import * as React from "react";
import { Typography, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { Employee, PermissionEnum } from "graphql/server-types.gen";
import { EmployeeLink } from "ui/components/links/people";

type Props = {
  disabled?: boolean;
  heading: string;
  blockedSubstitutes: Pick<Employee, "id" | "firstName" | "lastName">[];
  favoriteSubstitutes: Pick<Employee, "id" | "firstName" | "lastName">[];
  autoAssignedSubstitutes?: Pick<Employee, "id" | "firstName" | "lastName">[];
  autoAssignedSubsOnly?: boolean;
  editRoute: string;
  editing: boolean;
  editable: boolean;
  editPermission: PermissionEnum[];
};

export const SubstitutePrefCard: React.FC<Props> = ({
  disabled = false,
  ...props
}) => {
  const { t } = useTranslation();
  const history = useHistory();

  const showEditButton = !disabled && !props.editing && props.editable;

  const favoriteEmployees = props.favoriteSubstitutes
    ? props.favoriteSubstitutes
    : [];

  const blockedEmployees = props.blockedSubstitutes
    ? props.blockedSubstitutes
    : [];

  const autoAssignedEmployees = props.autoAssignedSubstitutes
    ? props.autoAssignedSubstitutes
    : [];

  return (
    <>
      <Section>
        <SectionHeader
          title={t(props.heading)}
          actions={[
            {
              text: t("Edit"),
              visible: showEditButton,
              execute: () => {
                history.push(props.editRoute);
              },
              permissions: props.editPermission,
            },
          ]}
        />
        <Grid container spacing={2}>
          {disabled && (
            <Grid container item spacing={2} xs={8}>
              <Grid item>
                <Typography variant="h6">
                  {t("Does not apply to positions that do not require subs.")}
                </Typography>
              </Grid>
            </Grid>
          )}
          {(!disabled ||
            favoriteEmployees.length > 0 ||
            blockedEmployees.length > 0 ||
            (props.autoAssignedSubsOnly &&
              (autoAssignedEmployees?.length ?? 0) > 0)) && (
            <>
              <Grid container item spacing={2} xs={5}>
                <Grid item xs={12} sm={6} lg={6}>
                  <Typography variant="h6">{t("Favorites")}</Typography>
                  {favoriteEmployees.length === 0 ? (
                    <div>{t("Not defined")}</div>
                  ) : (
                    favoriteEmployees.map((n, i) => (
                      <div key={i}>
                        <EmployeeLink orgUserId={n.id} color="black">
                          {n.firstName + " " + n.lastName}
                        </EmployeeLink>
                      </div>
                    ))
                  )}
                </Grid>
              </Grid>
              <Grid container item spacing={2} xs={5}>
                <Grid item xs={12} sm={6} lg={6}>
                  <Typography variant="h6">{t("Blocked")}</Typography>
                  {blockedEmployees.length === 0 ? (
                    <div>{t("Not defined")}</div>
                  ) : (
                    blockedEmployees.map((n, i) => (
                      <div key={i}>
                        <EmployeeLink orgUserId={n.id} color="black">
                          {n.firstName + " " + n.lastName}
                        </EmployeeLink>
                      </div>
                    ))
                  )}
                </Grid>
              </Grid>
              {props.autoAssignedSubsOnly && (
                <Grid container item spacing={2} xs={5}>
                  {autoAssignedEmployees && (
                    <Grid item xs={12} sm={6} lg={6}>
                      <Typography variant="h6">{t("Auto Assigned")}</Typography>
                      {autoAssignedEmployees.length === 0 ? (
                        <div>{t("Not defined")}</div>
                      ) : (
                        autoAssignedEmployees.map((n, i) => (
                          <div key={i}>
                            <EmployeeLink orgUserId={n.id} color="black">
                              {n.firstName + " " + n.lastName}
                            </EmployeeLink>
                          </div>
                        ))
                      )}
                    </Grid>
                  )}
                </Grid>
              )}
            </>
          )}
        </Grid>
      </Section>
    </>
  );
};
