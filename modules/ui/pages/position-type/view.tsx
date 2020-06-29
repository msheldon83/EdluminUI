import { Grid, makeStyles, Typography } from "@material-ui/core";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import Maybe from "graphql/tsutils/Maybe";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Redirect, useHistory } from "react-router";
import { getDisplayName } from "ui/components/enumHelpers";
import { boolToDisplay, minutesToHours } from "ui/components/helpers";
import { PageHeader } from "ui/components/page-header";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { GetPositionTypeById } from "ui/pages/position-type/graphql/position-type.gen";
import { useRouteParams } from "ui/routes/definition";
import {
  PositionTypeEditSettingsRoute,
  PositionTypeRoute,
  PositionTypeViewRoute,
} from "ui/routes/position-type";
import * as yup from "yup";
import { DeletePostionType } from "./graphql/DeletePositionType.gen";
import { UpdatePositionType } from "./graphql/update-position-type.gen";
import { NeedsReplacement, PermissionEnum } from "graphql/server-types.gen";
import { ReplacementCriteria } from "./replacement-criteria";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { GetPositionTypesDocument } from "reference-data/get-position-types.gen";
import { PositionTypeAbsReasonsCard } from "./components/position-type-abs-reasons-card";
import { ReturnLink } from "ui/components/links/return";

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
};

export const PositionTypeViewPage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(PositionTypeViewRoute);
  const [editing, setEditing] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);

  const positionTypesReferenceQuery = {
    query: GetPositionTypesDocument,
    variables: { orgId: params.organizationId },
  };

  const [deletePositionTypeMutation] = useMutationBundle(DeletePostionType, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const deletePositionType = React.useCallback(async () => {
    await deletePositionTypeMutation({
      variables: {
        positionTypeId: params.positionTypeId,
      },
      awaitRefetchQueries: true,
      refetchQueries: [
        "GetAllPositionTypesWithinOrg",
        positionTypesReferenceQuery,
      ],
    });
    history.push(PositionTypeRoute.generate(params));
  }, [
    deletePositionTypeMutation,
    history,
    params,
    positionTypesReferenceQuery,
  ]);

  const [updatePositionType] = useMutationBundle(UpdatePositionType, {
    refetchQueries: [positionTypesReferenceQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const enableDisablePositionType = React.useCallback(
    (enabled: boolean, rowVersion: string) => {
      return updatePositionType({
        variables: {
          positionType: {
            id: params.positionTypeId,
            rowVersion: rowVersion,
            expired: !enabled,
          },
        },
      });
    },
    [updatePositionType, params]
  );

  const getPositionType = useQueryBundle(GetPositionTypeById, {
    variables: { id: params.positionTypeId },
  });

  if (getPositionType.state === "LOADING") {
    return <></>;
  }

  const positionType = getPositionType?.data?.positionType?.byId;
  if (!positionType) {
    // Redirect the User back to the List page
    const listUrl = PositionTypeRoute.generate(params);
    return <Redirect to={listUrl} />;
  }

  const replacementCriteria = positionType?.replacementCriteria;
  const minimumDuration = minutesToHours(
    positionType.minAbsenceDurationMinutes,
    2
  );

  const displayMinimumDuration = (d: number | null) => {
    if (!d) {
      return t("No Minimum");
    }
    return d === 1
      ? t("1 hour")
      : t("{{hours}} hours", {
          hours: d,
        });
  };

  if (enabled === null) {
    setEnabled(!positionType.expired);
  }

  const updateName = async (name: string) => {
    await updatePositionType({
      variables: {
        positionType: {
          id: positionType.id,
          rowVersion: positionType.rowVersion,
          name,
        },
      },
    });
  };

  const updateExternalId = async (externalId?: string | null) => {
    await updatePositionType({
      variables: {
        positionType: {
          id: positionType.id,
          rowVersion: positionType.rowVersion,
          externalId,
        },
      },
    });
  };

  return (
    <>
      <div className={classes.linkPadding}>
        <ReturnLink
          linkClass={classes.link}
          defaultComingFrom={t("all position types")}
          defaultReturnUrl={PositionTypeRoute.generate(params)}
        />
      </div>
      <PageTitle title={t("Position Type")} withoutHeading={!isMobile} />
      <PageHeader
        text={positionType.name}
        label={t("Name")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.name)}
        editPermissions={[PermissionEnum.FinanceSettingsSave]}
        validationSchema={yup.object().shape({
          value: yup.string().required(t("Name is required")),
        })}
        onSubmit={async (value: Maybe<string>) => {
          await updateName(value!);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
        actions={[
          {
            name: t("Change History"),
            onClick: () => {},
          },
          {
            name: enabled ? t("Inactivate") : t("Activate"),
            onClick: async () => {
              await enableDisablePositionType(
                !enabled,
                positionType.rowVersion
              );
              setEnabled(!enabled);
            },
            permissions: [PermissionEnum.FinanceSettingsSave],
          },
          {
            name: t("Delete"),
            onClick: deletePositionType,
            permissions: [PermissionEnum.FinanceSettingsDelete],
          },
        ]}
        isInactive={!enabled}
        inactiveDisplayText={t("This position is currently inactive.")}
        onActivate={async () => {
          await enableDisablePositionType(true, positionType.rowVersion);
          setEnabled(true);
        }}
      />
      <PageHeader
        text={positionType.externalId}
        label={t("Identifier")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.externalId)}
        editPermissions={[PermissionEnum.FinanceSettingsSave]}
        validationSchema={yup.object().shape({
          value: yup.string().nullable(),
        })}
        onSubmit={async (value: Maybe<string>) => {
          await updateExternalId(value);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
        isSubHeader={true}
        showLabel={true}
      />

      <Section className={classes.content}>
        <SectionHeader
          title={t("Settings")}
          actions={[
            {
              text: t("Edit"),
              visible: !editing,
              execute: () => {
                const editSettingsUrl = PositionTypeEditSettingsRoute.generate(
                  params
                );
                history.push(editSettingsUrl);
              },
              permissions: [PermissionEnum.FinanceSettingsSave],
            },
          ]}
        />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} lg={6}>
            <Typography variant="h6">{t("Code")}</Typography>
            <div>{positionType.code ?? t("Not defined")}</div>
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <Typography variant="h6">{t("Use for employees")}</Typography>
            <div>{boolToDisplay(t, positionType.forPermanentPositions)}</div>
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <Typography variant="h6">
              {t("Needs substitute (default)")}
            </Typography>
            <div>
              {positionType.needsReplacement &&
                getDisplayName(
                  "needsReplacement",
                  positionType.needsReplacement.toString(),
                  t
                )}
            </div>
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <Typography variant="h6">{t("Use for vacancies")}</Typography>
            <div>{boolToDisplay(t, positionType.forStaffAugmentation)}</div>
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <Typography variant="h6">
              {t("Minimum absence duration")}
            </Typography>
            <div>{displayMinimumDuration(minimumDuration)}</div>
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <Typography variant="h6">{t("Default Contract")}</Typography>
            <div>
              {positionType.defaultContract ? (
                positionType.defaultContract.name
              ) : (
                <span className={classes.valueMissing}>
                  {t("Not Specified")}
                </span>
              )}
            </div>
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <Typography variant="h6">{t("Pay Type")}</Typography>
            <div>
              {getDisplayName(
                "payTypeId",
                positionType.payTypeId?.toString() ?? "",
                t
              )}
            </div>
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <Typography variant="h6">{t("Pay Code")}</Typography>
            <div>
              <div>
                {positionType?.payCode?.name ? (
                  positionType?.payCode?.name
                ) : (
                  <span className={classes.valueMissing}>
                    {t("Not Specified")}
                  </span>
                )}
              </div>
            </div>
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <Typography variant="h6">{t("Tracking Type")}</Typography>
            <div>
              {getDisplayName(
                "absenceReasonTrackingTypeId",
                positionType.absenceReasonTrackingTypeId?.toString() ?? "",
                t
              )}
            </div>
          </Grid>
        </Grid>
      </Section>
      {positionType.needsReplacement != NeedsReplacement.No && (
        <ReplacementCriteria
          editing={editing}
          replacementCriteria={replacementCriteria}
        />
      )}
      <PositionTypeAbsReasonsCard
        positionTypeId={positionType.id}
        positionTypeName={positionType.name}
        updateAbsenceReasons={async (values: {
          absenceReasonIds?: string[] | null;
        }) => {}}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  content: {
    marginTop: theme.spacing(2),
  },
  valueMissing: {
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
  link: {
    color: theme.customColors.blue,
    "&:visited": {
      color: theme.customColors.blue,
    },
  },
  linkPadding: {
    padding: "10px 0px 15px 10px",
  },
}));
