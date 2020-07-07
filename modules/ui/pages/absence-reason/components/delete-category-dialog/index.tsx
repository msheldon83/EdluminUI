import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { compact } from "lodash-es";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { TextButton } from "ui/components/text-button";
import { makeStyles } from "@material-ui/styles";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { GetAllAbsenceReasonsWithinCategory } from "../../graphql/get-absence-reasons-within-category.gen";
import { GetAllAbsenceReasonCategoriesWithinOrg } from "../../graphql/get-absence-reason-categories.gen";
import { DeleteCategoryDialogRow } from "./row";
import { OptionType, SelectNew } from "ui/components/form/select-new";

type Props = {
  isOpen: boolean;
  onAccept: (deleteCategoryMembers: boolean, newCategoryId?: string) => void;
  onCancel: () => void;
  orgId: string;
  absenceCategory: {
    id: string;
    name: string;
  };
};

export const DeleteCategoryDialog: React.FC<Props> = ({
  isOpen,
  onAccept,
  onCancel,
  orgId,
  absenceCategory,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [deleteMembers, setDeleteMembers] = React.useState<boolean>(false);
  const [destinationCategory, setDestinationCategory] = React.useState<
    string | undefined
  >(undefined);

  const getAllCategories = useQueryBundle(
    GetAllAbsenceReasonCategoriesWithinOrg,
    {
      fetchPolicy: "cache-first",
      variables: {
        orgId: orgId,
      },
    }
  );
  const destinationOptions = [{ value: "", label: "Uncategorized" }].concat(
    getAllCategories.state == "LOADING"
      ? []
      : compact(getAllCategories.data?.orgRef_AbsenceReasonCategory?.all ?? [])
          .filter(c => c.id != absenceCategory.id)
          .map(c => ({ value: c.id, label: c.name }))
  );

  const getAbsenceReasons = useQueryBundle(GetAllAbsenceReasonsWithinCategory, {
    fetchPolicy: "cache-first",
    variables: {
      orgId: orgId,
      includeExpired: true,
      absenceCategoryId: absenceCategory.id,
    },
  });
  const absenceReasons =
    getAbsenceReasons.state == "LOADING"
      ? []
      : compact(getAbsenceReasons.data?.orgRef_AbsenceReason?.all ?? []);

  return (
    <Dialog open={isOpen} onClose={onCancel} scroll="paper">
      <DialogTitle disableTypography>
        <Typography variant="h5">
          {t("Are you sure you want to delete this category?")}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {absenceReasons.length > 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12} className={classes.header}>
              <Typography variant="h6">
                {t("This category contains the following absence reasons:")}
              </Typography>
            </Grid>
            {absenceReasons.map(reason => (
              <DeleteCategoryDialogRow
                key={reason.id}
                name={reason.name ?? ""}
                description={reason.description ?? ""}
              />
            ))}
            <Grid item xs={12} className={classes.header}>
              <Typography variant="h6">
                {t("These reasons should be...")}
              </Typography>
            </Grid>
            <Grid item container xs={12}>
              <Grid item xs={6}>
                <RadioGroup
                  aria-label="delete-category-members"
                  name="delete-category-members"
                  value={deleteMembers ? "true" : "false"}
                  onChange={event =>
                    setDeleteMembers(event.target.value == "true")
                  }
                >
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label={t("...migrated to:")}
                  />
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label={t("...deleted")}
                  />
                </RadioGroup>
              </Grid>
              <Grid item xs={6}>
                <SelectNew
                  value={destinationOptions.find(
                    o => o.value == destinationCategory ?? ""
                  )}
                  multiple={false}
                  onChange={({ value }: OptionType) =>
                    setDestinationCategory(
                      value == "" ? undefined : (value as string)
                    )
                  }
                  options={destinationOptions}
                  withResetValue={false}
                  doSort={false}
                  disabled={deleteMembers}
                />
              </Grid>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <Divider variant="fullWidth" />
      <DialogActions>
        <TextButton onClick={onCancel} className={classes.buttonSpacing}>
          {t("No")}
        </TextButton>
        <ButtonDisableOnClick
          variant="outlined"
          onClick={() => onAccept(deleteMembers, destinationCategory)}
          className={classes.delete}
        >
          {t("Yes")}
        </ButtonDisableOnClick>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  buttonSpacing: {
    paddingRight: theme.spacing(2),
  },
  removeSub: {
    paddingTop: theme.spacing(2),
    fontWeight: theme.typography.fontWeightMedium,
  },
  dividedContainer: { display: "flex" },
  delete: { color: theme.customColors.blue },
  header: { textAlign: "center" },
}));
