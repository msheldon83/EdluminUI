import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Grid,
  makeStyles,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { PositionTypeSelect } from "ui/components/reference-selects/position-type-select";
import {
  buildVacancyUsagesJsonString,
  VacancyWorkflowUsage,
} from "../../types";
import { PermissionEnum, ApprovalWorkflowType } from "graphql/server-types.gen";
import { compact, flatMap } from "lodash-es";
import { usePositionTypes } from "reference-data/position-types";
import { Edit } from "@material-ui/icons";
import { Can } from "ui/components/auth/can";
import { useQueryBundle } from "graphql/hooks";
import { GetApprovalWorkflows } from "../../graphql/get-approval-workflows.gen";

type Props = {
  setFieldValue: Function;
  usages: string;
  orgId: string;
  editing: boolean;
  editable: boolean;
  setEditing?: (editing: string | null) => void;
  approvalWorkflowId?: string;
};

export const VacancyBasicInfo: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const getApprovalWorkflows = useQueryBundle(GetApprovalWorkflows, {
    variables: {
      orgId: props.orgId,
      workFlowType: ApprovalWorkflowType.Vacancy,
    },
  });

  let allApprovalWorkflows =
    getApprovalWorkflows.state === "DONE"
      ? getApprovalWorkflows.data?.approvalWorkflow?.all
      : [];
  if (props.approvalWorkflowId) {
    allApprovalWorkflows = allApprovalWorkflows?.filter(
      x => x?.id !== props.approvalWorkflowId
    );
  }
  const allExistingUsages = compact(
    flatMap(allApprovalWorkflows?.map(a => a?.usages)) as VacancyWorkflowUsage[]
  );
  const existingAllOthersUsage =
    allExistingUsages.some(x => x.allOthers) ?? false;
  const existingPositionTypeIds = compact(
    allExistingUsages.map(x => x.positionTypeId)
  );

  const usages: VacancyWorkflowUsage[] = JSON.parse(props.usages);
  const positionTypeIds = compact(usages.map(x => x.positionTypeId));
  const isAllOthers = usages.some(x => x.allOthers) ?? false;

  const allPositionTypes = usePositionTypes(props.orgId);

  return (
    <Grid item container xs={12} spacing={2}>
      {props.editing ? (
        <Grid item xs={4}>
          <PositionTypeSelect
            orgId={props.orgId}
            includeAllOption={false}
            label={t("Position types")}
            selectedPositionTypeIds={positionTypeIds}
            setSelectedPositionTypeIds={(ids?: string[]) =>
              props.setFieldValue(
                "usages",
                buildVacancyUsagesJsonString(isAllOthers, ids)
              )
            }
            disabled={isAllOthers}
            idsToRemoveFromOptions={
              existingPositionTypeIds.length > 0
                ? existingPositionTypeIds
                : undefined
            }
          />
        </Grid>
      ) : (
        <Grid item xs={12}>
          <div className={classes.container}>
            <div className={classes.text}>{`${t("For position types")}: ${
              isAllOthers
                ? t("All non-specified")
                : positionTypeIds.length === 0
                ? t("None")
                : allPositionTypes
                    .filter(x => positionTypeIds.includes(x.id))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(x => x.name)
                    .join(", ")
            }`}</div>
            {props.editable && (
              <Can do={[PermissionEnum.ApprovalSettingsSave]}>
                <Edit
                  className={classes.editIcon}
                  onClick={() => {
                    props.setEditing!("usage-info");
                  }}
                />
              </Can>
            )}
          </div>
        </Grid>
      )}
      {props.editing && !existingAllOthersUsage && (
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isAllOthers}
                onChange={e => {
                  if (e.target.checked) {
                    props.setFieldValue(
                      "usages",
                      buildVacancyUsagesJsonString(e.target.checked)
                    );
                  } else {
                    props.setFieldValue(
                      "usages",
                      buildVacancyUsagesJsonString(
                        !e.target.checked,
                        positionTypeIds
                      )
                    );
                  }
                }}
                value={isAllOthers}
                color="primary"
              />
            }
            label={t("All non-specified")}
          />
        </Grid>
      )}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  text: {
    fontSize: theme.typography.pxToRem(24),
  },
  container: {
    display: "flex",
    alignItems: "center",
  },
  editIcon: {
    cursor: "pointer",
    color: theme.customColors.edluminSubText,
    height: theme.typography.pxToRem(15),
    width: theme.typography.pxToRem(15),
    marginLeft: theme.spacing(1),
  },
}));
