import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "hooks";
import { makeStyles } from "@material-ui/core";
import { GetPositionTypeById } from "ui/pages/position-type/position-type.gen";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { oc } from "ts-optchain";
import { Grid } from "@material-ui/core";
import { Edit, Clear, Check } from "@material-ui/icons";
import { minutesToHours, boolToDisplay } from "ui/components/helpers";
import { getDisplayName } from "ui/components/enumHelpers";
import { Redirect } from "react-router";
import {
  PositionTypeRoute,
  PositionTypeViewRoute,
} from "ui/routes/position-type";
import { useRouteParams } from "ui/routes/definition";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Formik } from "formik";
import { useState } from "react";
import * as yup from "yup";
import { UpdatePositionTypeName } from "./update-position-type-name.gen";
import { UpdatePositionTypeExternalId } from "./update-position-type-external-id.gen";

const editableSections = {
  name: "name",
  externalId: "externalId",
  settings: "settings",
};

export const PositionTypeViewPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";
  const [editing, setEditing] = useState<string | null>(null);
  const { role, organizationId, positionTypeId } = useRouteParams(
    PositionTypeViewRoute
  );

  const [updatePositionTypeName] = useMutationBundle(UpdatePositionTypeName);
  const [updatePositionTypeExternalId] = useMutationBundle(
    UpdatePositionTypeExternalId
  );
  const getPositionType = useQueryBundle(GetPositionTypeById, {
    variables: { id: Number(positionTypeId) },
  });

  if (getPositionType.state === "LOADING") {
    return <></>;
  }

  const positionType = oc(getPositionType).data.positionType.byId();
  if (!positionType) {
    // Redirect the User back to the List page
    const listUrl = PositionTypeRoute.generate({
      role,
      organizationId,
    });
    return <Redirect to={listUrl} />;
  }

  const singleLineWrapper = (sectionName: string, child: JSX.Element) => {
    return (
      <>
        <Grid item>{child}</Grid>
        <Grid item>
          {!editing && (
            <Edit
              className={classes.action}
              onClick={() => setEditing(sectionName)}
            />
          )}
        </Grid>
      </>
    );
  };

  const renderName = (name: string) => {
    if (editing !== editableSections.name) {
      return singleLineWrapper(
        editableSections.name,
        <h1 className={classes.headerText}>{positionType.name}</h1>
      );
    }

    return singleLineWrapper(
      editableSections.name,
      <Formik
        initialValues={{ name }}
        onSubmit={async (data, meta) => {
          await updateName(data);
          setEditing(null);
        }}
        validationSchema={yup.object().shape({
          name: yup.string().required(t("Name is required")),
        })}
      >
        {({ handleSubmit, submitForm }) => (
          <form onSubmit={handleSubmit}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <FormTextField
                  label={t("Name")}
                  name="name"
                  margin={isMobile ? "normal" : "none"}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item>
                <Clear
                  className={classes.action}
                  onClick={() => setEditing(null)}
                />
              </Grid>
              <Grid item>
                <Check className={classes.action} onClick={submitForm} />
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    );
  };

  const updateName = async (data: { name: string }) => {
    const { name } = data;
    await updatePositionTypeName({
      variables: {
        positionType: {
          positionTypeId: positionType.id,
          rowVersion: positionType.rowVersion,
          name,
        },
      },
    });
  };

  const renderExternalId = (externalId?: string | null) => {
    if (editing !== editableSections.externalId) {
      return singleLineWrapper(
        editableSections.externalId,
        <>{`${t("External Id")} ${positionType.externalId || "[NONE]"}`}</>
      );
    }

    return singleLineWrapper(
      editableSections.externalId,
      <Formik
        initialValues={{ externalId }}
        onSubmit={async (data, meta) => {
          await updateExternalId(data);
          setEditing(null);
        }}
        validationSchema={yup.object().shape({
          externalId: yup.string().nullable(),
        })}
      >
        {({ handleSubmit, submitForm }) => (
          <form onSubmit={handleSubmit}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <FormTextField
                  label={t("External Id")}
                  name="externalId"
                  margin={isMobile ? "normal" : "none"}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item>
                <Clear
                  className={classes.action}
                  onClick={() => setEditing(null)}
                />
              </Grid>
              <Grid item>
                <Check className={classes.action} onClick={submitForm} />
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    );
  };

  const updateExternalId = async (data: { externalId?: string | null }) => {
    const { externalId } = data;
    await updatePositionTypeExternalId({
      variables: {
        positionType: {
          positionTypeId: positionType.id,
          rowVersion: positionType.rowVersion,
          externalId,
        },
      },
    });
  };

  const renderSettings = () => {};

  return (
    <>
      <PageTitle title={t("Position Type")} withoutHeading={!isMobile} />
      <div className={classes.header}>
        <Grid container alignItems="center" spacing={2}>
          {renderName(positionType.name)}
        </Grid>
        <Grid container alignItems="center" spacing={2}>
          {renderExternalId(positionType.externalId)}
        </Grid>
      </div>
      <Section>
        <SectionHeader
          title={t("Settings")}
          action={{
            text: t("Edit"),
            visible: !editing,
            execute: () => {},
          }}
        />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} lg={6}>
            <div className={classes.label}>{t("Use For Employees")}</div>
            <div>{boolToDisplay(t, positionType.forPermanentPositions)}</div>
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            <div className={classes.label}>
              {t("Needs Substitute (default)")}
            </div>
            <div>
              {positionType.needsReplacement &&
                getDisplayName(
                  "needsReplacement",
                  positionType.needsReplacement.toString(),
                  t
                )}
            </div>
          </Grid>
          <Grid item xs={12}>
            <div className={classes.label}>{t("Use For Vacancies")}</div>
            <div>{boolToDisplay(t, positionType.forStaffAugmentation)}</div>
          </Grid>
          <Grid item xs={12}>
            <div className={classes.label}>{t("Minimum Absence Duration")}</div>
            <div>
              {`${minutesToHours(
                positionType.minAbsenceDurationMinutes,
                2
              )} hour(s)`}
            </div>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: "20px",
  },
  headerText: {
    margin: 0,
  },
  action: {
    cursor: "pointer",
  },
  smallAction: {
    cursor: "pointer",
    height: "0.75em",
  },
  label: {
    fontWeight: 500,
  },
}));
