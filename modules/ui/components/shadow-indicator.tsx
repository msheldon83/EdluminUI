import * as React from "react";
import { Chip, makeStyles } from "@material-ui/core";
import LockOutlined from "@material-ui/icons/LockOutlined";

type Props = {
  isShadow: boolean;
  orgName: string | null | undefined;
};

export const ShadowIndicator: React.FC<Props> = props => {
  const classes = useStyles();
  const { isShadow, orgName } = props;

  return isShadow ? (
    <Chip
      size="small"
      icon={<LockOutlined />}
      label={orgName}
      classes={{
        root: classes.shadowChip,
        icon: classes.shadowChipIcon,
      }}
    />
  ) : (
    <></>
  );
};

const useStyles = makeStyles(theme => ({
  shadowChip: {
    color: theme.customColors.white,
    backgroundColor: theme.customColors.darkGray,
  },
  shadowChipIcon: {
    color: theme.customColors.white,
  },
}));
