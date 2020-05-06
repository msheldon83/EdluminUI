import * as React from "react";
import { useState } from "react";
import {
  Button,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
} from "@material-ui/core";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import { makeStyles } from "@material-ui/core";
import { ShowNetworkErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { useMutationBundle } from "graphql/hooks";
import {
  SaveDataImportMutation,
  SaveDataImportInput,
  formSerializer,
} from "./graphql/save-data-import";
import { ImportTypeFilter } from "./import-type-filter";
import { DataImportType } from "graphql/server-types.gen";
import { ActionButtons } from "ui/components/action-buttons";
import { formatEnumString } from "ui/components/enumHelpers";

type Props = {
  orgId: string;
  onClose: () => void;
  refetchImports?: () => Promise<void>;
  importType?: DataImportType;
};

export const ImportDataForm: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const [fileToSave, setFileToSave] = useState<File>();

  const [saveDataImport] = useMutationBundle(SaveDataImportMutation, {
    onError: error => {
      ShowNetworkErrors(error, openSnackbar);
    },
  });

  const onSaveDataImport = async (input: SaveDataImportInput) => {
    const result = await saveDataImport({
      variables: {
        input: input,
        formSerializer: formSerializer,
      },
    });
    if (props.refetchImports) {
      await props.refetchImports();
    }
    if (result.data?.saveDataImport.isSuccess) {
      openSnackbar({
        message: t("Import has been submitted"),
        dismissable: true,
        status: "info",
        autoHideDuration: 5000,
      });
      return true;
    } else {
      // This will show parse errors since parse returns a 200
      openSnackbar({
        message: result.data?.saveDataImport.message,
        dismissable: true,
        status: "error",
      });
      return false;
    }
  };

  return (
    <>
      <Formik
        initialValues={{
          importTypeId: props.importType
            ? props.importType
            : DataImportType.Employee,
          file: fileToSave,
          importAction: "validate" as "validate" | "import" | "parse",
          notificationEmailAddresses: "",
        }}
        onReset={(values, formProps) => {
          formProps.setFieldValue("importTypeId", DataImportType.Employee);
          formProps.setFieldValue("file", undefined);
          setFileToSave(undefined);
          formProps.setFieldValue("importAction", "validate");
          formProps.setFieldValue("notificationEmailAddresses", "");
          props.onClose();
        }}
        onSubmit={async (data: any, formProps) => {
          const result = await onSaveDataImport({
            importOptions: {
              orgId: props.orgId,
              dataImportTypeId: formatEnumString(data.importTypeId.toString()),
              parseOnly: data.importAction === "parse",
              validateOnly: data.importAction === "validate",
              notificationEmailAddresses:
                data.notificationEmailAddresses.length > 0
                  ? data.notificationEmailAddresses
                      .replace(/\s/g, "")
                      .split(",")
                  : undefined,
            },
            file: data.file,
          });
          if (result) {
            formProps.resetForm();
            props.onClose();
          }
        }}
        validationSchema={yup.object().shape({
          notificationEmailAddresses: yup
            .array()
            .transform(function(value, originalValue) {
              if (this.isType(value) && value !== null) {
                return value;
              }
              return originalValue ? originalValue.split(/[\s,]+/) : [];
            })
            .of(
              yup.string().email(({ value }) => `${value} is not a valid email`)
            ),
          file: yup
            .mixed()
            .required(t("A file is required"))
            .test(
              "fileType",
              "Only CSV files are supported",
              value =>
                value &&
                value.name
                  .split(".")
                  .pop()
                  .toLowerCase() === "csv"
            ),
        })}
      >
        {({
          values,
          handleSubmit,
          setFieldValue,
          submitForm,
          handleReset,
          resetForm,
          errors,
        }) => (
          <form className={classes.form} onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <ImportTypeFilter
                  includeAllOption={false}
                  selectedTypeId={values.importTypeId}
                  setSelectedTypeId={(typeId?: DataImportType) => {
                    if (typeId) setFieldValue("importTypeId", typeId);
                  }}
                  disabled={props.importType !== undefined}
                />
                <div className={classes.fileUpload}>
                  <input
                    type="file"
                    id="contained-button-file"
                    accept=".csv"
                    className={classes.input}
                    onChange={event => {
                      if (event.target.files && event.target.files.length > 0) {
                        setFileToSave(event.target.files[0]);
                        setFieldValue("file", event.target.files[0]);
                      }
                    }}
                  />
                  <label htmlFor="contained-button-file">
                    <Button variant="outlined" component="span">
                      {t("Attach file")}
                    </Button>
                  </label>
                  <div>{values.file && values.file.name}</div>
                  {errors.file && (
                    <div className={classes.errorMsg}>{errors.file}</div>
                  )}
                </div>
              </Grid>
              <Grid item xs={3}>
                <div className={classes.label}>{t("Import action")}</div>
                <RadioGroup
                  value={values.importAction}
                  onChange={e => setFieldValue("importAction", e.target.value)}
                >
                  <FormControlLabel
                    value={"parse"}
                    control={<Radio color="primary" />}
                    label={t("Check file headers, no import")}
                    labelPlacement="end"
                  />
                  <FormControlLabel
                    value={"validate"}
                    control={<Radio color="primary" />}
                    label={t("Check file data, no import")}
                    labelPlacement="end"
                  />
                  <FormControlLabel
                    value={"import"}
                    control={<Radio color="primary" />}
                    label={t("Import data")}
                    labelPlacement="end"
                  />
                </RadioGroup>
              </Grid>
              <Grid item xs={4}>
                <div className={classes.label}>
                  {t("Email addresses to notify")}
                </div>
                <TextField
                  name={"notificationEmailAddresses"}
                  value={values.notificationEmailAddresses}
                  multiline
                  rows="6"
                  variant="outlined"
                  fullWidth
                  onChange={e =>
                    setFieldValue("notificationEmailAddresses", e.target.value)
                  }
                  placeholder={t(
                    "email1@redroverk12.com, email2@redroverk12.com"
                  )}
                  error={errors.notificationEmailAddresses ? true : false}
                  helperText={errors.notificationEmailAddresses}
                />
              </Grid>
            </Grid>
            <ActionButtons
              submit={{ text: t("Import"), execute: submitForm }}
              cancel={{ text: t("Cancel"), execute: handleReset }}
            />
          </form>
        )}
      </Formik>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  form: {
    width: "100%",
  },
  details: {
    padding: 0,
    display: "block",
  },
  input: {
    display: "none",
  },
  label: {
    color: theme.customColors.eduBlack,
    fontSize: theme.typography.pxToRem(14),
    marginBottom: theme.spacing(0.4),
    lineHeight: theme.typography.pxToRem(21),
  },
  fileUpload: {
    paddingTop: theme.spacing(2),
  },
  errorMsg: {
    color: theme.customColors.darkRed,
  },
}));
