import {
  makeStyles,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Grid,
  Typography,
  Divider,
} from "@material-ui/core";
import {
  PermissionCategoryIdentifierInput,
  PermissionCategory,
} from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { OptionTypeBase } from "react-select/src/types";
import { Input } from "ui/components/form/input";
import { Select, SelectValueType } from "ui/components/form/select";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useMemo, useState } from "react";
import Maybe from "graphql/tsutils/Maybe";
import { ExpandMore } from "@material-ui/icons";

type Props = {
  orgId: string;
  permissionDefinitions: PermissionCategory[];
  permissionSetCategories: PermissionCategoryIdentifierInput[];
  onChange: (
    categories: PermissionCategoryIdentifierInput[]
  ) => Promise<unknown>;
};

// const buildContractOptions = (
//   contracts: Array<Contract>,
//   positionType: Props["positionType"]
// ) => {
//   // Format the contracts as dropdown options
//   const contractOptions = contracts.map(c => {
//     return { value: Number(c.id), label: c.name };
//   });

//   // Handle if the current Position Type is associated with an Expired Contract
//   if (
//     positionType.defaultContract &&
//     !contracts.find(c => Number(c.id) === positionType.defaultContractId)
//   ) {
//     contractOptions.push({
//       value: positionType.defaultContract.id,
//       label: positionType.defaultContract.name,
//     });
//   }

//   return contractOptions;
// };

export const PermissionSettings: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const [categories, setCategories] = useState<
    PermissionCategoryIdentifierInput[]
  >(props.permissionSetCategories);

  console.log(props.permissionDefinitions);

  if (props.permissionDefinitions.length === 0) {
    // The permission definitions haven't been loaded yet
    return <></>;
  }

  const getSelectedLevel = (
    categoryId: string,
    settingId: string
  ): string | undefined => {
    const levelId = categories
      ?.find(c => c.id === categoryId)
      ?.settings?.find(s => s?.id === settingId)?.levelId;
    return levelId;
  };

  const updateCategorySelections = async (
    categoryId: string,
    settingId: string,
    levelId: string
  ) => {
    const updatedCategories = {
      ...categories,
    };

    // Find the Category and add if missing
    let matchingCategory = updatedCategories.find(c => c.id === categoryId);
    if (!matchingCategory) {
      matchingCategory = {
        id: categoryId,
        settings: [],
      };
      updatedCategories.push(matchingCategory);
    }
    if (!matchingCategory.settings) {
      matchingCategory.settings = [];
    }

    // Find the Setting and add if missing
    let matchingSetting = matchingCategory.settings?.find(
      s => s?.id === settingId
    );
    if (!matchingSetting) {
      matchingSetting = {
        id: settingId,
        levelId: levelId,
      };
      matchingCategory.settings.push(matchingSetting);
    }
    matchingSetting.levelId = levelId;

    await props.onChange(updatedCategories);
  };

  return (
    <>
      {props.permissionDefinitions.map(pd => {
        const categoryId = pd.id;
        return (
          <ExpansionPanel defaultExpanded={true} key={categoryId}>
            <ExpansionPanelSummary
              expandIcon={<ExpandMore />}
              aria-label="Expand"
              aria-controls={`${categoryId}-content`}
              id={categoryId}
              //className={classes.summary}
            >
              <Typography variant={"h5"}>{pd.displayName}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                {pd.settings.map((s, sIndex) => {
                  const settingId = s.id;
                  const settingClass = [];
                  if (sIndex % 2 === 1) {
                    settingClass.push(classes.alternatingItem);
                  }

                  // Construct Level Options
                  const levelOptions = s.levels.map(l => {
                    return { value: l.id, label: l.displayName };
                  });
                  const matchedLevelId = getSelectedLevel(
                    categoryId,
                    settingId
                  );
                  const selectedLevel =
                    levelOptions.find((p: any) => p.value === matchedLevelId) ??
                    levelOptions[0];

                  return (
                    <Grid
                      item
                      xs={12}
                      container
                      alignItems="center"
                      key={s.id}
                      className={settingClass.join(" ")}
                    >
                      <Grid item xs={4} className={classes.settingLabel}>
                        {s.displayName}
                      </Grid>
                      <Grid item xs={8}>
                        <div className={classes.levelSelect}>
                          <Select
                            value={selectedLevel}
                            label=""
                            options={levelOptions}
                            isClearable={false}
                            onChange={(e: SelectValueType) => {
                              //TODO: Once the select component is updated,
                              // can remove the Array checking
                              let selectedValue = null;
                              if (e) {
                                if (Array.isArray(e)) {
                                  selectedValue = (e as Array<
                                    OptionTypeBase
                                  >)[0].value;
                                } else {
                                  selectedValue = (e as OptionTypeBase).value;
                                }
                              }
                              console.log(categoryId, settingId, selectedValue);
                              await updateCategorySelections(
                                categoryId,
                                settingId,
                                selectedValue
                              );
                            }}
                          />
                        </div>
                      </Grid>
                    </Grid>
                  );
                })}
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        );
      })}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  alternatingItem: {
    background: theme.customColors.lightGray,
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    borderBottom: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
  },
  settingLabel: {
    paddingLeft: theme.spacing(2),
  },
  levelSelect: {
    width: theme.typography.pxToRem(300),
  },

  useForEmployeesSubItems: {
    marginLeft: theme.spacing(4),
  },
  needSubLabel: {
    marginTop: theme.spacing(2),
  },
  mobileSectionSpacing: {
    marginTop: theme.spacing(2),
  },
  formHelperText: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  normalSectionSpacing: {
    marginTop: theme.spacing(6),
  },
  contractSection: {
    maxWidth: "500px",
    "& p": {
      marginLeft: 0,
    },
  },
  minAbsenceSection: {
    maxWidth: "500px",
    "& p": {
      marginLeft: 0,
    },
  },
  minAbsenceDurationLabel: {
    marginTop: theme.spacing(2),
  },
  checkboxError: {
    color: theme.palette.error.main,
  },
  appliesToError: {
    marginTop: theme.spacing(2),
    fontSize: theme.typography.pxToRem(14),
  },
  payTypeSection: {
    maxWidth: "500px",
    "& p": {
      marginLeft: 0,
    },
  },
}));
