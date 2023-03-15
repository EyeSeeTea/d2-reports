import React from "react";
// @ts-ignore
import { CalendarInput } from "@dhis2-ui/calendar";
import { WidgetFeedback } from "../WidgetFeedback";
import { DataValueDate } from "../../../../domain/common/entities/DataValue";
import { WidgetProps } from "./WidgetBase";
import styled from "styled-components";

export interface DateWidgetProps extends WidgetProps {
    dataValue: DataValueDate;
}

const DateWidget: React.FC<DateWidgetProps> = props => {
    const { onValueChange, dataValue, disabled } = props;

    const notifyChange = React.useCallback(
        (value: { calendarDate: DateCalendar } | null) => {
            const dateValue = value?.calendarDate || undefined;
            onValueChange({ ...dataValue, value: dateValue });
        },
        [onValueChange, dataValue]
    );

    const value = dataValue.value;
    const dateStr = value ? [value.year, pad2(value.month), pad2(value.day)].join("-") : "";

    return (
        <WidgetFeedback state={props.state}>
            <FixClearStyles>
                <CalendarInput
                    date={dateStr}
                    label={undefined}
                    disabled={disabled}
                    clearable={Boolean(value)}
                    onDateSelect={notifyChange}
                />
            </FixClearStyles>
        </WidgetFeedback>
    );
};

function pad2(n: number): string {
    return n.toString().padStart(2, "0");
}

interface DateCalendar {
    year: number;
    month: number;
    day: number;
}

const FixClearStyles = styled.div`
    .calendar-clear-button {
        inset-block-start: 7px !important;
    }
`;

export default React.memo(DateWidget);
