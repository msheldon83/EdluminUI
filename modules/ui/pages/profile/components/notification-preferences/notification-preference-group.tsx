import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { NotificationGroupHeader } from "./notification-header";
import { PreferenceRow } from "./preference-row";
import { NotificationPreferenceGroup } from "./preference-helper";

type Props = {
  showEmailColumn: boolean;
  showSmsColumn: boolean;
  showInAppColumn: boolean;
  role?: string | null;
  setFieldValue: Function;
  notificationPreferences: NotificationPreferenceGroup[];
};

export const NotificationGroup: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.container}>
      <NotificationGroupHeader
        showEmailColumn={props.showEmailColumn}
        showSmsColumn={props.showSmsColumn}
        showInAppColumn={props.showInAppColumn}
        roleLabel={props.role}
      />
      {props.notificationPreferences.map((r, i) => {
        return (
          <PreferenceRow
            key={i}
            notificationPreference={r}
            shadeRow={i % 2 == 1}
            setFieldValue={props.setFieldValue}
            index={r.originalIndex}
            showEmailColumn={props.showEmailColumn}
            showSmsColumn={props.showSmsColumn}
            showInAppColumn={props.showInAppColumn}
          />
        );
      })}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    paddingBottom: theme.spacing(4),
  },
}));
