import * as React from "react";
import { useState } from "react";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { Section } from "ui/components/section";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { CreateContractScheduleDialog } from "./create-contract-schedule-dialog";
import { TextButton } from "ui/components/text-button";
import { ErrorOutline } from "@material-ui/icons";
import { CreateContractSchedule } from "./graphql/create-contract-schedule.gen";
import { GetContractsWithoutSchedules } from "./graphql/get-contracts-without-schedules.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import {
  ContractScheduleCreateInput,
  PermissionEnum,
} from "graphql/server-types.gen";
import { Can } from "ui/components/auth/can";
import { compact } from "lodash-es";
import { parseISO } from "date-fns";

type Props = {
  orgId: string;
  schoolYear: {
    id: string;
    startDate: string;
    endDate: string;
  };
};

export const ContractScheduleWarningSingleSchoolYear: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const schoolYear = props.schoolYear;

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [contract, setContract] = useState<
    | {
        id: string;
        name: string;
      }
    | undefined
  >(undefined);

  const schoolYearName = `${parseISO(
    schoolYear.startDate
  ).getFullYear()} - ${parseISO(schoolYear.endDate).getFullYear()}`;

  const getContractsWithoutSchedules = useQueryBundle(
    GetContractsWithoutSchedules,
    {
      variables: {
        orgId: props.orgId,
        schoolYearId: schoolYear.id,
      },
    }
  );
  const contractsWithoutSchedules =
    getContractsWithoutSchedules.state !== "LOADING"
      ? compact(
          getContractsWithoutSchedules?.data?.contract
            ?.contractsWithoutSchedules ?? []
        )
      : [];

  const onCloseCreateDialog = () => {
    setContract(undefined);
    setCreateDialogOpen(false);
  };

  const onSaveContractSchedule = async (
    contractScheduleInput: ContractScheduleCreateInput
  ) => {
    const result = await createContractSchedule({
      variables: {
        contractSchedule: {
          ...contractScheduleInput,
          orgId: props.orgId,
          schoolYearId: schoolYear.id,
        },
      },
    });
    if (result.data) {
      onCloseCreateDialog();
    }
  };

  const [createContractSchedule] = useMutationBundle(CreateContractSchedule, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    refetchQueries: ["GetContractsWithoutSchedules"],
  });

  if (contractsWithoutSchedules.length === 0) {
    return <></>;
  }

  return (
    <>
      <CreateContractScheduleDialog
        onClose={onCloseCreateDialog}
        onSave={onSaveContractSchedule}
        open={createDialogOpen}
        schoolYear={schoolYear}
        contract={contract}
        orgId={props.orgId}
      />

      <Section>
        <div className={classes.container}>
          <ErrorOutline className={classes.errorIcon} />
          <div className={classes.textContainer}>
            <div className={classes.headingText}>{`${t(
              "These contracts do not have a start date for the"
            )} ${schoolYearName} ${t("school year")}`}</div>
            <div className={classes.headingSubText}>
              {t(
                "Employees assigned to these contracts will not be able to create absences until this step is completed"
              )}
            </div>
            <div>
              {contractsWithoutSchedules.map((c, i) => {
                return (
                  <div key={i} className={classes.contractContainer}>
                    <div className={classes.contractName}>{c.name} </div>
                    <div>
                      <Can do={[PermissionEnum.FinanceSettingsSave]}>
                        <TextButton
                          color="primary"
                          onClick={() => {
                            setContract(c);
                            setCreateDialogOpen(true);
                          }}
                        >
                          {t("Set start date")}
                        </TextButton>
                      </Can>
                      <Can not do={[PermissionEnum.FinanceSettingsSave]}>
                        <div>
                          {t(
                            "Contact your district admin to set the start date"
                          )}
                        </div>
                      </Can>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
  },
  contractContainer: {
    display: "flex",
    paddingTop: theme.spacing(1),
  },
  textContainer: {
    paddingLeft: theme.spacing(1),
  },
  headingText: {
    fontSize: theme.typography.pxToRem(16),
    fontWeight: 600,
    color: theme.customColors.darkRed,
  },
  headingSubText: {
    fontSize: theme.typography.pxToRem(14),
    fontWeight: "normal",
    color: theme.customColors.darkRed,
  },
  contractName: {
    fontSize: theme.typography.pxToRem(14),
    width: "30%",
  },
  errorIcon: {
    color: theme.customColors.darkRed,
  },
}));
