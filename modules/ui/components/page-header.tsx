import clsx from "clsx";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { Check, Clear, Edit } from "@material-ui/icons";
import { Formik } from "formik";
import Maybe from "graphql/tsutils/Maybe";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "ui/components/form/input";
import { Spacing } from "ui/components/spacing";
import { Padding } from "ui/components/padding";
import { CrossFade } from "ui/components/cross-fade";
import { ActionMenu, Option } from "./action-menu";
import { TextButton } from "./text-button";
import { useMemo } from "react";
import { Can } from "./auth/can";
import { CanDo } from "./auth/types";

type Props = {
  text: string | null | undefined;
  label: string;
  actions?: Array<Option>;
  editable?: boolean;
  onEdit?: Function;
  validationSchema?: any;
  onSubmit?: (value: Maybe<string>) => Promise<unknown>;
  onCancel?: Function;
  isSubHeader?: boolean;
  showLabel?: boolean;
  isInactive?: boolean;
  inactiveDisplayText?: string | null | undefined;
  onActivate?: () => Promise<unknown>;
  editPermissions?: CanDo;
  permissionContext?: any;
};

export const PageHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [editing, setEditing] = React.useState(false);

  useEffect(() => {
    if (props.editable) {
      setEditing(false);
    }
  }, [props.editable]);

  const activateButton = useMemo(() => {
    return (
      <TextButton
        className={classes.activateAction}
        onClick={async () => {
          await props.onActivate!();
        }}
      >
        {t("Activate")}
      </TextButton>
    );
  }, [props.onActivate, classes.activateAction, t]);

  const wrapper = (child: JSX.Element) => {
    return (
      <>
        {props.isInactive && (
          <Grid
            container
            justify="space-between"
            alignItems="center"
            className={classes.activateHeader}
          >
            <Grid item>
              {props.inactiveDisplayText || t("This is currently inactive.")}
            </Grid>
            {props.onActivate && (
              <Grid item>
                {props.editPermissions ? (
                  <Can
                    do={props.editPermissions}
                    context={props.permissionContext}
                  >
                    {activateButton}
                  </Can>
                ) : (
                  activateButton
                )}
              </Grid>
            )}
          </Grid>
        )}
        <div className={classes.header}>
          <Grid
            container
            alignItems="center"
            justify="space-between"
            spacing={2}
            className={`${props.isSubHeader ? classes.subHeader : ""}`}
          >
            {child}
            {props.actions && (
              <Grid item>
                <ActionMenu options={props.actions} />
              </Grid>
            )}
          </Grid>
        </div>
      </>
    );
  };

  const headerIsEditable =
    props.editable && props.onEdit && props.onSubmit && props.onCancel;

  const textDisplay = props.text ? (
    props.text
  ) : (
    <span className={classes.valueMissing}>{t("Not Specified")}</span>
  );

  const label = props.showLabel ? <>{`${props.label}: `}</> : "";
  const editButton = useMemo(() => {
    return (
      <Grid item style={{ paddingLeft: 0 }}>
        <Edit
          className={clsx({
            [classes.action]: !props.isSubHeader,
            [classes.smallAction]: props.isSubHeader,
            [classes.editIcon]: true,
          })}
          onClick={() => {
            props.onEdit!();
            setEditing(true);
          }}
        />
      </Grid>
    );
  }, [
    props.onEdit,
    props.isSubHeader,
    classes.action,
    classes.smallAction,
    classes.editIcon,
    setEditing,
  ]);

  // not editing
  const renderViewMode = () => {
    return wrapper(
      <Grid item xs={10}>
        <Grid
          item
          container
          alignItems="center"
          justify="flex-start"
          spacing={isMobile ? 1 : 2}
        >
          <Grid item>
            {!props.isSubHeader ? (
              <Typography variant="h1">
                {label}
                {textDisplay}
              </Typography>
            ) : (
              <Typography variant="h6">
                {label}
                {textDisplay}
              </Typography>
            )}
          </Grid>
          {headerIsEditable &&
            (props.editPermissions ? (
              <Can do={props.editPermissions} context={props.permissionContext}>
                {editButton}
              </Can>
            ) : (
              editButton
            ))}
          {props.children}
        </Grid>
      </Grid>
    );
  };

  const renderEditMode = () => {
    return wrapper(
      <Formik
        initialValues={{ value: props.text || "" }}
        onSubmit={async (data: { value: Maybe<string> }, meta) => {
          if (props.onSubmit) {
            const valueToSend =
              data.value && data.value.trim().length === 0 ? null : data.value;
            await props.onSubmit(valueToSend);
          }
          setEditing(false);
        }}
        validationSchema={props.validationSchema || null}
      >
        {({ handleSubmit, submitForm, values, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Spacing bottom={2}>
              <Grid container alignItems="flex-end" spacing={2}>
                <Grid item>
                  <Input
                    value={values.value}
                    label={props.label}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      values.value = e.target.value;
                      setFieldValue("value", e.target.value);
                    }}
                    name="value"
                    fullWidth
                  />
                </Grid>
                <Padding bottom={2}>
                  <Grid item>
                    <Clear
                      className={
                        props.isSubHeader ? classes.smallAction : classes.action
                      }
                      onClick={() => {
                        setEditing(false);
                        props.onCancel!();
                      }}
                    />
                  </Grid>
                </Padding>
                <Padding bottom={2}>
                  <Grid item>
                    <Check
                      className={
                        props.isSubHeader ? classes.smallAction : classes.action
                      }
                      onClick={submitForm}
                    />
                  </Grid>
                </Padding>
              </Grid>
            </Spacing>
          </form>
        )}
      </Formik>
    );
  };

  return (
    <CrossFade fadeKey={editing.toString()}>
      {editing ? renderEditMode() : renderViewMode()}
    </CrossFade>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginLeft: theme.spacing(),
    "& h1": {
      margin: 0,
    },
  },
  subHeader: {
    marginTop: theme.spacing(0.5),
  },
  action: {
    cursor: "pointer",
  },
  smallAction: {
    cursor: "pointer",
    height: "0.75em",
  },
  valueMissing: {
    fontWeight: "normal",
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
  activateHeader: {
    background: theme.customColors.marigold,
    boxShadow:
      "0px 2px 2px rgba(0, 0, 0, 0.24), 0px 0px 2px rgba(0, 0, 0, 0.12)",
    borderRadius: "4px",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginBottom: theme.spacing(2),
    minHeight: theme.spacing(6),
  },
  activateAction: {
    color: theme.customColors.eduBlack,
  },
  editIcon: {
    color: theme.customColors.edluminSubText,
    height: theme.typography.pxToRem(15),
    width: theme.typography.pxToRem(15),
  },
}));
