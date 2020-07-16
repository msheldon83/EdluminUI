import React, { useState, useEffect } from "react";
import {
	Grid,
	makeStyles,
	Typography,
	Tooltip
} from "@material-ui/core";
import { Period, Schedule, GetError } from "ui/pages/employee-position/components/helpers";
import { FormikTimeInput } from "ui/components/form/formik-time-input";
import { FormikErrors, useField, useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import InfoIcon from "@material-ui/icons/Info";
import { TimeInputProps } from "./time-input";
import { isBefore, parseISO } from "date-fns";

type Props = Omit<
	TimeInputProps,
	"name" | "label" | "onChange" | "onValidTime"
> & {
	index: number;
	permitReversedTimes: boolean;
	validationMessage ?: string | undefined;
	errors: FormikErrors<{ schedules: Schedule[] }>;
	startTimeName: string;
	endTimeName: string;
	period: Period;
}

/*
Expected behavior is such that if the times are reversed on load, no confirmation is displayed, as the
assumption is that this is existing data previously confirmed.  Perhaps this is an invalid assumption
and an option should be exposed to control the behavior.

Expected behavior is such that the first time the times are reversed, the confirmation will be displayed.
If:
	Person corrects time reversal, confirmation is removed
	or
	Person confirms tims reversal, any subsequent changes, even flipping back and forth from reversed to unreversed and back to reversed, will not prompt another confirmation
*/

export const FormikTimespanInput: React.FC<Props> = props => {
	const { t } = useTranslation();
	const classes = useStyles();

	const [startTimeField, _] = useField(props.startTimeName);
	const [endTimeField, _] = useField(props.endTimeName);

	const [showWarning, setShowWarning] = useState(false)
	const [initialLoad, setInitialLoad] = useState(true);
	const [warningConfirmed, setWarningConfirmed] = useState(false);
	const index = props.index;
	const formik = useFormikContext();
	const startTimeError = GetError(props.errors, "startTime", index, props.scheduleIndex);
	const endTimeError = GetError(props.errors, "endTime", index, props.scheduleIndex);


	useEffect(() => {
			//if this jawn is initially loaded with reversed time values, bypass all the warnings, as someone previously confirmed it
		if (isBefore(parseISO(endTimeField.value), parseISO(startTimeField.value))) props.period.overMidnightConfirmed = true;
	}, []);

	useEffect(() => {
		checkDisplayWarning(startTimeField.value, endTimeField.value);
	}, [startTimeField.value, endTimeField.value]);

	useEffect(() => {
		formik.validateForm();
	}, [warningConfirmed]);

	

	const onWarningConfirmedClick = () => {
		props.period.overMidnightConfirmed = true;
		setWarningConfirmed(true);
	}

	const checkDisplayWarning = React.useCallback(
		async (
			startTime: string
			, endTime: string
		) => {

			//if (warningConfirmed) return;
			if (props.period.overMidnightConfirmed) return;
			if (initialLoad) {
				setInitialLoad(false);
				return;
			}

			var timesReversed = isBefore(parseISO(endTime), parseISO(startTime));
			setShowWarning(timesReversed);
		});

	const renderReversedTimesInfo = () => {
		if (
			!props.permitReversedTimes
			|| warningConfirmed
			|| !showWarning

		) return (<></>);

		return (
			<div className={classes.warningMessageContainer}>
				<div className={classes.warningMessage}>
					<TextButton onClick={() => onWarningConfirmedClick()} className={classes.warningText}>
						{t("Confirm schedule crosses midnight.")}

						<Tooltip
							title={
								<div className={classes.tooltip}>
									{t(
										"In the times you entered, the end time is earlier than the start time.  Click to confirm this is intentional, or correct the times if not."
									)}
								</div>
							}
							placement="right-start"
						>
							<InfoIcon
								color="primary"
								style={{
									fontSize: "16px",
								}}
							/>
						</Tooltip>
					</TextButton >
				</div>
			</div>
		)
	}
	
	return (
		<>
			<div className={classes.startTime}>
				<Typography>{t("Starting")}</Typography>
				<FormikTimeInput
					label=""
					name={props.startTimeName}
					inputStatus={startTimeError ? "error" : "default"}
					validationMessage={startTimeError}
				/>
			</div>
			<div className={classes.endTime}>
				<Typography>{t("Ending")}</Typography>
				<FormikTimeInput
					label=""
					name={props.endTimeName}
					inputStatus={endTimeError ? "error" : "default"}
					earliestTime={props.permitReversedTimes ? undefined : props.period.startTime}
					validationMessage={endTimeError}
				/>
			</div>
			{renderReversedTimesInfo()}
		</>
	);
};


const useStyles = makeStyles(theme => ({
	button: {
		color: theme.customColors.blue,
		padding: 0,
		fontWeight: "normal",
		textDecoration: "underline",
		fontSize: theme.typography.pxToRem(14),
		letterSpacing: theme.typography.pxToRem(0.5),

		"&:hover": {
			backgroundColor: "inherit",
			textDecoration: "underline",
		},
		tooltip: {
			padding: theme.spacing(2),
		},
	},
	startTime: {
		//this should be controlled by the container that consumes this component, but I couldn't work it out in a timely fashion.
		margin: theme.spacing(2)
	},
	endTime: {
		marginLeft: theme.spacing(2),
	},
	warningMessageContainer: {
		display: "table",
		height: "100%",
		marginLeft: theme.spacing(2)

	},
	warningMessage: {
		display: "table-cell",
		verticalAlign: "bottom",
		paddingBottom: theme.spacing(3),
	}
	, warningText: {
		color: theme.customColors.primary
	}
}));
