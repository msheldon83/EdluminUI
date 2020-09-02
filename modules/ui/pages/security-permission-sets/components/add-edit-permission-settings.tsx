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
import {
  SelectDEPRECATED,
  SelectValueType,
} from "ui/components/form/select-DEPRECATED";
import { useMemo, useState, useEffect } from "react";
import { ExpandMore } from "@material-ui/icons";

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

  const updateCategorySelections = async (
    categoryId: string,
    settingId: string,
    levelId: string
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

                  return (
                    <Grid
                      item
                      xs={12}
                      container
                      alignItems="center"
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
                            selectedLevel.label
                          )}
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
}));
