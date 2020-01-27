import { Grid, makeStyles, Typography } from "@material-ui/core";
import { Check, Clear, Edit } from "@material-ui/icons";
import { Formik } from "formik";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "ui/components/form/input";
import { CrossFade } from "ui/components/CrossFade";
import { Margin } from "ui/components/margin";
import { Padding } from "ui/components/padding";
import { ActionMenu, Option } from "./action-menu";
import { TextButton } from "./text-button";
import { useMemo } from "react";
import { Can } from "./auth/can";
import { CanDo } from "./auth/types";

export type FieldData = {
  key: string;
  value: string | null | undefined;
  label: string;
};

type Props = {
  text: string | null | undefined;
  label: string;
  fields: Array<FieldData>;
  actions?: Array<Option>;
  editable?: boolean;
  onEdit?: Function;
  validationSchema?: any;
  onSubmit?: (value: Array<FieldData>) => Promise<unknown>;
  onCancel?: Function;
  isSubHeader?: boolean;
  showLabel?: boolean;
  isInactive?: boolean;
  inactiveDisplayText?: string | null | undefined;
  onActivate?: () => Promise<unknown>;
  editPermissions?: CanDo;
};

export const PageHeaderMultiField: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [editing, setEditing] = React.useState(false);

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
                  <Can do={props.editPermissions}>{activateButton}</Can>
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
      <Grid item>
        <Edit
          className={props.isSubHeader ? classes.smallAction : classes.action}
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
    setEditing,
  ]);

  const renderEditMode = () => {
    return wrapper(
      <Formik
        initialValues={{ fields: props.fields || [] }}
        onSubmit={async (data: { fields: Array<FieldData> }, meta) => {
          if (props.onSubmit) {
            const valuesToSend =
              data.fields &&
              data.fields.map(v => ({
                key: v.key,
                value: v.value && v.value.trim().length === 0 ? null : v.value,
                label: v.label,
              }));
            await props.onSubmit(valuesToSend);
          }
          setEditing(false);
        }}
        // TODO figure out why validation isn't working
        //validationSchema={props.validationSchema || null}
      >
        {({ handleSubmit, submitForm, values, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Margin bottom={2}>
              <Grid container alignItems="center" spacing={2}>
                {values.fields.map((field: FieldData, index: number) => (
                  <Grid item key={field.key}>
                    <Input
                      name={field.key}
                      label={field.label}
                      value={field.value ? field.value : ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        field.value = e.target.value;
                        setFieldValue("fields", values.fields);
                      }}
                    />
                  </Grid>
                ))}
                <Padding top={4}>
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
                <Padding top={4}>
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
            </Margin>
          </form>
        )}
      </Formik>
    );
  };

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
              <Can do={props.editPermissions}>{editButton}</Can>
            ) : (
              editButton
            ))}
        </Grid>
      </Grid>
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
    marginBottom: theme.spacing(2),
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
}));
