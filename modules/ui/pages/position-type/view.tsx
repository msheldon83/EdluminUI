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

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
};

export const PositionTypeViewPage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const history = useHistory();
  const params = useRouteParams(PositionTypeViewRoute);
  const [editing, setEditing] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);

  const [deletePositionTypeMutation] = useMutationBundle(DeletePostionType);
  const deletePositionType = React.useCallback(() => {
    history.push(PositionTypeRoute.generate(params));
    return deletePositionTypeMutation({
      variables: {
        positionTypeId: Number(params.positionTypeId),
      },
    });
  }, [deletePositionTypeMutation, history, params]);

  const [updatePositionType] = useMutationBundle(UpdatePositionType);
  const enableDisablePositionType = React.useCallback(
    (enabled: boolean, rowVersion: string) => {
      return updatePositionType({
        variables: {
          positionType: {
            id: Number(params.positionTypeId),
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

  if (enabled === null) {
    setEnabled(!positionType.expired);
  }

  const updateName = async (name: string) => {
    await updatePositionType({
      variables: {
        positionType: {
          id: Number(positionType.id),
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
          id: Number(positionType.id),
          rowVersion: positionType.rowVersion,
          externalId,
        },
      },
    });
  };

  return (
    <>
      <PageTitle title={t("Position Type")} withoutHeading={!isMobile} />
      <PageHeader
        text={positionType.name}
        label={t("Name")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.name)}
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
          },
          {
            name: t("Delete"),
            onClick: deletePositionType,
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
        label={t("External ID")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.externalId)}
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

      <Section>
        <SectionHeader
          title={t("Settings")}
          action={{
            text: t("Edit"),
            visible: !editing,
            execute: () => {
              const editSettingsUrl = PositionTypeEditSettingsRoute.generate(
                params
              );
              history.push(editSettingsUrl);
            },
          }}
        />
        <Grid container spacing={2}>
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
            <div>
              {`${minutesToHours(
                positionType.minAbsenceDurationMinutes,
                2
              )} hour(s)`}
            </div>
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
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  valueMissing: {
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
}));
