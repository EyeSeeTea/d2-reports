import React from "react";
// @ts-ignore
import { Radio, Button } from "@dhis2/ui";
import { WidgetFeedback } from "../WidgetFeedback";
import { DataValueBoolean } from "../../../../domain/common/entities/DataValue";
import { WidgetProps } from "./WidgetBase";
import { makeStyles } from "@material-ui/core";
import { useAppContext } from "../../../contexts/app-context";

export interface BooleanWidgetProps extends WidgetProps {
    dataValue: DataValueBoolean;
}

const BooleanWidget: React.FC<BooleanWidgetProps> = props => {
    const { onValueChange, dataValue, disabled } = props;
    const { config } = useAppContext();

    const notifyChange = React.useCallback(
        (value: boolean | undefined) => {
            onValueChange({ ...dataValue, value });
        },
        [onValueChange, dataValue]
    );

    const stateValue = dataValue.value;

    const classes = useStyles();

    return (
        <WidgetFeedback state={props.state}>
            <div className={classes.wrapper}>
                <Radio
                    checked={stateValue === true}
                    label={config.translations.yes}
                    disabled={disabled}
                    onChange={() => notifyChange(true)}
                />

                <Radio
                    checked={stateValue === false}
                    label={config.translations.no}
                    disabled={disabled}
                    onChange={() => notifyChange(false)}
                />

                <Button small onClick={() => notifyChange(undefined)} tabIndex="-1" disabled={disabled}>
                    ✕
                </Button>
            </div>
        </WidgetFeedback>
    );
};

const useStyles = makeStyles({
    wrapper: { display: "flex", gap: 10 },
});

export default React.memo(BooleanWidget);
