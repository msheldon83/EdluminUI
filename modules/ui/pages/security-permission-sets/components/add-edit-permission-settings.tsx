import {
  makeStyles,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Grid,
  Checkbox,
  FormControlLabel,
  Typography,
  Divider,
  FormGroup,
} from "@material-ui/core";
import {
  PermissionCategoryIdentifierInput,
  PermissionCategory,
  PermissionLevelOptionIdentifierInput,
  PermissionLevelOption,
} from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { OptionTypeBase } from "react-select/src/types";
import {
  SelectDEPRECATED,
  SelectValueType,
} from "ui/components/form/select-DEPRECATED";
import { useMemo, useState, useEffect } from "react";
import { ExpandMore } from "@material-ui/icons";
import { findMatchingAssignmentsForDetails } from "ui/pages/absence/helpers";

type Props = {
  orgId: string;
  permissionDefinitions: PermissionCategory[];
  permissionSetCategories: PermissionCategoryIdentifierInput[];
  editable: boolean;
  onChange: (
    categories: PermissionCategoryIdentifierInput[]
  ) => Promise<unknown>;
};

export const PermissionSettings: React.FC<Props> = props => {
  const {
    permissionSetCategories,
    permissionDefinitions,
    orgId,
    onChange,
    editable,
  } = props;
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const [categories, setCategories] = useState<
    PermissionCategoryIdentifierInput[]
  >(permissionSetCategories);

  interface LevelOptionsDisplay {
    optionId: string;
    enabled: boolean;
    displayName: string;
  }

  if (permissionDefinitions.length === 0) {
    // The permission definitions haven't been loaded yet
    return <></>;
  }

  const seedPermissionCategories = async (
    permissionDefinitions: PermissionCategory[]
  ) => {
    const updatedCategories: PermissionCategoryIdentifierInput[] = permissionDefinitions.map(
      c => {
        return {
          categoryId: c.categoryId,
          settings: c.settings.map(s => {
            return {
              settingId: s.settingId,
              levelId: s.levels[0]?.levelId,
            };
          }),
        };
      }
    );
    setCategories(updatedCategories);
    await onChange(updatedCategories);
  };
  if (!categories || categories.length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    seedPermissionCategories(permissionDefinitions);
  }

  const getSelectedLevel = (
    categoryId: string,
    settingId: string
  ): string | undefined => {
    const levelId = categories
      ?.find(c => c.categoryId === categoryId)
      ?.settings?.find(s => s?.settingId === settingId)?.levelId;
    return levelId;
  };

  const getAvailableLevelOptions = (
    categoryId: string,
    settingId: string,
    selectedLevel: string
  ) => {
    const allowedOptions: LevelOptionsDisplay[] = [];
    const levels = permissionDefinitions
      ?.find(c => c.categoryId === categoryId)
      ?.settings?.find(s => s?.settingId === settingId)?.levels;
    const selectedLevelIndex = levels?.findIndex(
      l => l.levelId === selectedLevel
    );
    if (levels && selectedLevelIndex && selectedLevelIndex >= 0) {
      for (let i = 0; i <= selectedLevelIndex; i++) {
        levels[i].options.forEach(option => {
          allowedOptions.push({
            optionId: option.optionId,
            enabled: isOptionEnabled(categoryId, settingId, option.optionId),
            displayName: option.displayName,
          });
        });
      }
    }
    return allowedOptions;
  };

  const getSelectedLevelOptionsViewText = (
    categoryId: string,
    settingId: string,
    selectedLevel: string
  ) => {
    let selectedLevelOptionsText = "";
    const selectedLevelOptions = getAvailableLevelOptions(
      categoryId,
      settingId,
      selectedLevel
    )?.filter(o => o.enabled === true);
    if (selectedLevelOptions && selectedLevelOptions.length > 0) {
      selectedLevelOptionsText =
        " (+ " +
        selectedLevelOptions
          .map(o => {
            return o.displayName;
          })
          .join(", ") +
        ")";
    }
    return selectedLevelOptionsText;
  };

  const isOptionEnabled = (
    categoryId: string,
    settingId: string,
    optionId: string
  ) => {
    return (
      categories
        ?.find(c => c.categoryId === categoryId)
        ?.settings?.find(s => s?.settingId === settingId)
        ?.options?.find(o => o?.optionId === optionId)?.enabled ?? false
    );
  };

  const updateCategorySelections = async (
    categoryId: string,
    settingId: string,
    levelId: string,
    optionId?: string,
    enabled?: boolean
  ) => {
    const updatedCategories = [...categories];

    // Find the Category and add if missing
    let matchingCategory = updatedCategories.find(
      c => c.categoryId === categoryId
    );
    if (!matchingCategory) {
      matchingCategory = {
        categoryId,
        settings: [],
      };
      updatedCategories.push(matchingCategory);
    }

    // Ensure the Category has a Settings array
    if (!matchingCategory.settings) {
      matchingCategory.settings = [];
    }

    // Find the Setting and add if missing
    let matchingSetting = matchingCategory.settings?.find(
      s => s?.settingId === settingId
    );
    if (!matchingSetting) {
      matchingSetting = {
        settingId,
        levelId: levelId,
      };
      matchingCategory.settings.push(matchingSetting);
    }
    matchingSetting.levelId = levelId;

    // Look to see if options need to be reset or modified
    const oldOptions = matchingSetting.options;
    matchingSetting.options = [];
    const availableLevelOptions = getAvailableLevelOptions(
      categoryId,
      settingId,
      levelId
    );
    if (availableLevelOptions && availableLevelOptions.length > 0) {
      availableLevelOptions.forEach(option => {
        // If option is being passed in then use the new value
        // If option existed in prior level - then keep enabled value
        const newEnabled =
          optionId === option.optionId
            ? enabled
            : oldOptions?.find(oo => oo?.optionId === option.optionId)?.enabled;
        matchingSetting!.options!.push({
          optionId: option.optionId,
          enabled: newEnabled ? newEnabled : false,
        });
      });
    }

    setCategories(updatedCategories);
    await onChange(updatedCategories);
  };

  return (
    <>
      {permissionDefinitions.map(pd => {
        const categoryId = pd.categoryId;
        return (
          <ExpansionPanel defaultExpanded={true} key={categoryId}>
            <ExpansionPanelSummary
              expandIcon={<ExpandMore />}
              aria-label="Expand"
              aria-controls={`${categoryId}-content`}
              id={categoryId}
            >
              <Typography variant={"h5"}>{pd.displayName}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                {pd.settings.map((s, sIndex) => {
                  const settingId = s.settingId;
                  const settingClass = [];
                  if (sIndex % 2 === 1) {
                    settingClass.push(classes.alternatingItem);
                  }

                  // Construct Level Options
                  const levelOptions = s.levels.map(l => {
                    return { value: l.levelId, label: l.displayName };
                  });
                  const matchedLevelId = getSelectedLevel(
                    categoryId,
                    settingId
                  );
                  const selectedLevel =
                    levelOptions.find((p: any) => p.value === matchedLevelId) ??
                    levelOptions[0];

                  const availableLevelOptions = getAvailableLevelOptions(
                    categoryId,
                    settingId,
                    selectedLevel.value
                  );

                  return (
                    <Grid
                      item
                      xs={12}
                      container
                      alignItems="flex-start"
                      key={s.settingId}
                      className={settingClass.join(" ")}
                    >
                      <Grid item xs={4} className={classes.settingLabel}>
                        {s.displayName}
                      </Grid>
                      <Grid item xs={8}>
                        <div className={classes.levelSelect}>
                          {editable ? (
                            <SelectDEPRECATED
                              value={selectedLevel}
                              label=""
                              options={levelOptions}
                              isClearable={false}
                              onChange={async (e: SelectValueType) => {
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
                                await updateCategorySelections(
                                  categoryId,
                                  settingId,
                                  selectedValue
                                );
                              }}
                            />
                          ) : (
                            selectedLevel.label +
                            getSelectedLevelOptionsViewText(
                              categoryId,
                              settingId,
                              selectedLevel.value
                            )
                          )}
                        </div>
                        {editable && (
                          <FormGroup row className={classes.levelOptions}>
                            {availableLevelOptions?.map(o => {
                              return (
                                <FormControlLabel
                                  key={o.optionId}
                                  control={
                                    <Checkbox
                                      checked={o.enabled}
                                      onChange={async e => {
                                        await updateCategorySelections(
                                          categoryId,
                                          settingId,
                                          selectedLevel.value,
                                          o.optionId,
                                          e.target.checked
                                        );
                                      }}
                                      color="primary"
                                    />
                                  }
                                  label={o.displayName}
                                />
                              );
                            })}
                          </FormGroup>
                        )}
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
  levelOptions: {
    paddingTop: theme.spacing(),
  },
}));
