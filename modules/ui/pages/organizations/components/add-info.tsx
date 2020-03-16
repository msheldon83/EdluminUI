import { Grid, makeStyles, FormHelperText } from "@material-ui/core";
import { Formik } from "formik";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as Yup from "yup";
import { ActionButtons } from "../../../components/action-buttons";
import { Input } from "ui/components/form/input";

type Props = {
  organization: {
    name: string;
    externalId?: string | null | undefined;
  };
  namePlaceholder: string;
  onSubmit: (name: string, externalId?: string | null | undefined) => void;
  onCancel: () => void;
  onNameChange: (name: string) => void;
};

export const AddBasicInfo: React.FC<Props> = props => {
  return;
};
