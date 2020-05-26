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
import { compact } from "lodash-es";

type Props = {
  setFieldValue: Function;
  usages: string;
  orgId: string;
};

export const VacancyBasicInfo: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const usages: VacancyWorkflowUsage[] = JSON.parse(props.usages);
  const positionTypeIds = compact(usages.map(x => x.positionTypeId));
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
              buildVacancyUsagesJsonString(isAllOthers, ids)
            )
          }
          disabled={isAllOthers}
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
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({}));
