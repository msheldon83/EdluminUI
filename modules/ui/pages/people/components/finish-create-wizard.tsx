import * as React from "react";
import { useIsMobile } from "hooks";
import { makeStyles } from "@material-ui/styles";
import { Section } from "ui/components/section";
import { useTranslation } from "react-i18next";
import { ActionButtons } from "ui/components/action-buttons";
import { useOrganization } from "reference-data/organization";
import { Formik } from "formik";
import * as yup from "yup";
import { OrganizationType } from "graphql/server-types.gen";
import {
  Grid,
  RadioGroup,
  Radio,
  FormControlLabel,
  Typography,
} from "@material-ui/core";

type Props = {
  orgUserName: string;
  orgUserType: string;
  orgId: string;
  onSubmit: (orgUser: any) => Promise<unknown>;
  onCancel: () => void;
};

export const FinishWizard: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const getOrganization = useOrganization(props.orgId);
  const orgType = getOrganization?.config?.organizationTypeId;

  return (
    <Section>
      <Formik
        initialValues={{
          inviteImmediately:
            orgType == OrganizationType.Standard ? true : false,
          createAnother: false,
        }}
        onSubmit={props.onSubmit}
        validationSchema={yup.object().shape({
          inviteImmediately: yup
            .boolean()
            .required(t("Invitation selection required")),
          createAnother: yup.boolean().required(t("Create selection required")),
        })}
      >
        {({ values, handleSubmit, submitForm, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6" className={classes.label}>
                {t(
                  `Do you want to invite ${props.orgUserName} to create their account right away?`
                )}
              </Typography>
              <RadioGroup
                aria-label="inviteImmediately"
                name="inviteImmediately"
                value={values.inviteImmediately}
                onChange={e => {
                  setFieldValue("inviteImmediately", e.target.value === "true");
                }}
                row={!isMobile}
              >
                <FormControlLabel
                  value={false}
                  control={<Radio color="primary" />}
                  label={t("No")}
                  labelPlacement="end"
                />
                <FormControlLabel
                  value={true}
                  control={<Radio color="primary" />}
                  label={t("Yes")}
                  labelPlacement="end"
                />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6" className={classes.label}>
                {t(`Do you want to create another ${props.orgUserType}?`)}
              </Typography>
              <RadioGroup
                aria-label="createAnother"
                name="createAnother"
                value={values.createAnother}
                onChange={e => {
                  setFieldValue("createAnother", e.target.value === "true");
                }}
                row={!isMobile}
              >
                <FormControlLabel
                  value={false}
                  control={<Radio color="primary" />}
                  label={t("No")}
                  labelPlacement="end"
                />
                <FormControlLabel
                  value={true}
                  control={<Radio color="primary" />}
                  label={t("Yes")}
                  labelPlacement="end"
                />
              </RadioGroup>
            </Grid>
            <ActionButtons
              submit={{ text: t("Save"), execute: submitForm }}
              cancel={{ text: t("Cancel"), execute: props.onCancel }}
            />
          </form>
        )}
      </Formik>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  label: {
    marginTop: theme.spacing(4),
  },
}));
