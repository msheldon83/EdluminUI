import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { DayOfWeek, UserAvailableTimeInput } from "graphql/server-types.gen";
import { SingleDay } from "./single-day";
import { makeStyles } from "@material-ui/core";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetMyAvailableTime } from "../graphql/get-available-time.gen";
import { SaveAvailableTime } from "../graphql/save-available-time.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";

type Props = {
  userId: string;
};

export const RegularSchedule: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const days = Object.values(DayOfWeek);

  const [saveAvailableTime] = useMutationBundle(SaveAvailableTime, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const getAvailableTime = useQueryBundle(GetMyAvailableTime);

  const user = useMemo(() => {
    if (getAvailableTime.state === "DONE") {
      return getAvailableTime.data.userAccess?.me?.user;
    }
    return null;
  }, [getAvailableTime]);

  const onChangeAvailability = async (
    availableTime: UserAvailableTimeInput
  ) => {
    const result = await saveAvailableTime({ variables: { availableTime } });
    if (result?.data) {
      await getAvailableTime.refetch();
      return true;
    } else {
      return false;
    }
  };

  if (!user) {
    return <></>;
  }

  return (
    <>
      <Section className={classes.section}>
        <SectionHeader title={t("Recurring Availability")} />
        <div className={classes.container}>
          {days.map((d, i) => {
            const at = user?.availableTime
              ? user.availableTime.find(x => x?.daysOfWeek.includes(d))
              : null;
            return (
              <SingleDay
                key={i}
                dayOfWeek={d}
                onChange={onChangeAvailability}
                userId={props.userId}
                id={at?.id}
                availability={at?.availabilityType}
                time={at?.availableTime}
              />
            );
          })}
        </div>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  section: {
    marginBottom: theme.spacing(0),
  },
}));
