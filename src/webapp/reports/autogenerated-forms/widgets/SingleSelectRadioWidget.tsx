import _ from "lodash";
import React from "react";
// @ts-ignore
import { Radio, Button } from "@dhis2/ui";
import { WidgetFeedback } from "../WidgetFeedback";
import { WidgetProps } from "./WidgetBase";
import { makeStyles } from "@material-ui/core";
import { DataValueSingle } from "./SingleSelectWidget";
import { Option } from "../../../../domain/common/entities/DataElement";

export interface DataValueSingleWidgetProps extends WidgetProps {
    dataValue: DataValueSingle;
    options: Option<string>[];
}

const SingleSelectRadioWidget: React.FC<DataValueSingleWidgetProps> = props => {
    const { onValueChange, dataValue, disabled, options } = props;

    const notifyChange = React.useCallback(
        (value: string | undefined) => {
            onValueChange({ ...dataValue, value: value });
        },
        [onValueChange, dataValue]
    );

    const { value } = dataValue;

    const classes = useStyles();

    const selectedValue = React.useMemo(
        () => (_(options).some(option => option.value === value) ? value : undefined),
        [value, options]
    );

    return (
        <WidgetFeedback state={props.state}>
            <div className={classes.wrapper}>
                {options.map(option => (
                    <Radio
                        key={option.value}
                        checked={option.value === selectedValue}
                        label={option.name}
                        disabled={disabled}
                        onChange={() => notifyChange(option.value)}
                    />
                ))}

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

export default React.memo(SingleSelectRadioWidget);
