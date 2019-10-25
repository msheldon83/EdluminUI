import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "hooks";
import { Typography } from "@material-ui/core";
import { GetPositionTypeById } from "ui/pages/position-type/graphql/position-type.gen";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { makeStyles, Grid } from "@material-ui/core";
import { minutesToHours, boolToDisplay } from "ui/components/helpers";
import { getDisplayName } from "ui/components/enumHelpers";
import { Redirect, useHistory } from "react-router";
import {
  PositionTypeRoute,
  PositionTypeViewRoute,
  PositionTypeEditSettingsRoute,
} from "ui/routes/position-type";
import { useRouteParams } from "ui/routes/definition";
import { useState } from "react";
import * as yup from "yup";
import { UpdatePositionTypeName } from "./graphql/update-name.gen";
import { UpdatePositionTypeExternalId } from "./graphql/update-external-id.gen";
import { PageHeader } from "ui/components/page-header";
import { DeletePostionType } from "./graphql/DeletePositionType.gen";
import Maybe from "graphql/tsutils/Maybe";

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
  settings: "edit-settings",
};

export const PositionTypeViewPage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useScreenSize() === "mobile";
  const history = useHistory();
  const params = useRouteParams(PositionTypeViewRoute);
  const [editing, setEditing] = useState<string | null>(null);

  const [deletePositionMutation] = useMutationBundle(DeletePostionType);
  const deletePosition = React.useCallback(() => {
    history.push(PositionTypeRoute.generate(params));
    return deletePositionMutation({
      variables: {
        positionTypeId: Number(params.positionTypeId),
      },
    });
  }, [deletePositionMutation, history, params]);

  const [updatePositionTypeName] = useMutationBundle(UpdatePositionTypeName);
  const [updatePositionTypeExternalId] = useMutationBundle(
    UpdatePositionTypeExternalId
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

  const updateName = async (name: string) => {
    await updatePositionTypeName({
      variables: {
        positionType: {
          positionTypeId: Number(positionType.id),
          rowVersion: positionType.rowVersion,
          name,
        },
      },
    });
  };

  const updateExternalId = async (externalId?: string | null) => {
    await updatePositionTypeExternalId({
      variables: {
        positionType: {
          positionTypeId: Number(positionType.id),
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
        onSubmit={async (data: { value: Maybe<string> }) => {
          await updateName(data.value!);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
        actions={[
          {
            name: t("Change History"),
            onClick: () => {},
          },
          {
            name: t("Disable"),
            onClick: () => {},
          },
          {
            name: t("Delete"),
            onClick: deletePosition,
          },
        ]}
      />
      <PageHeader
        text={positionType.externalId}
        label={t("External ID")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.externalId)}
        validationSchema={yup.object().shape({
          value: yup.string().nullable(),
        })}
        onSubmit={async (data: { value: Maybe<string> }) => {
          await updateExternalId(data.value);
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
