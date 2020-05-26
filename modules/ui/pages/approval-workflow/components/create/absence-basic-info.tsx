import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Grid,
  makeStyles,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { PositionTypeSelect } from "ui/components/reference-selects/position-type-select";
import { OrgUserSelect } from "ui/components/domain-selects/org-user-select/org-user-select";
import { OrgUserRole } from "graphql/server-types.gen";
import {
  buildAbsenceUsagesJsonString,
  AbsenceWorkflowUsage,
} from "../../types";
import { compact } from "lodash-es";

type Props = {
  setFieldValue: Function;
  usages: string;
  orgId: string;
};

export const AbsenceBasicInfo: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const usages: AbsenceWorkflowUsage[] = JSON.parse(props.usages);
  const positionTypeIds = compact(usages.map(x => x.positionTypeId));
  const employeeIds = compact(usages.map(x => x.employeeId));
  const isAllOthers = usages.some(x => x.allOthers) ?? false;

  return (
    <Grid item container xs={12} spacing={2}>
      <Grid item xs={12}>
        <PositionTypeSelect
          orgId={props.orgId}
          includeAllOption={false}
          label={t("Position types")}
          selectedPositionTypeIds={positionTypeIds}
          setSelectedPositionTypeIds={(ids?: string[]) =>
            props.setFieldValue(
              "usages",
              buildAbsenceUsagesJsonString(isAllOthers, ids, employeeIds)
            )
          }
          disabled={isAllOthers}
        />
      </Grid>
      <Grid item xs={12}>
        <OrgUserSelect
          orgId={props.orgId}
          role={OrgUserRole.Employee}
          selectedOrgUserIds={employeeIds}
          label={t("Employees")}
          disabled={isAllOthers}
          includeAllOption={false}
          setSelectedOrgUserIds={(ids?: string[]) =>
            props.setFieldValue(
              "usages",
              buildAbsenceUsagesJsonString(isAllOthers, positionTypeIds, ids)
            )
          }
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isAllOthers}
              onChange={e => {
                if (e.target.checked) {
                  props.setFieldValue(
                    "usages",
                    buildAbsenceUsagesJsonString(e.target.checked)
                  );
                } else {
                  props.setFieldValue(
                    "usages",
                    buildAbsenceUsagesJsonString(
                      e.target.checked,
                      positionTypeIds,
                      employeeIds
                    )
                  );
                }
              }}
              value={isAllOthers}
              color="primary"
            />
          }
          label={t("All non-specified employees and position types")}
        />
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  placeholder: {
    opacity: "0.2",
    filter: "alpha(opacity = 20)",
  },
  checkboxError: {
    color: theme.palette.error.main,
  },
}));
