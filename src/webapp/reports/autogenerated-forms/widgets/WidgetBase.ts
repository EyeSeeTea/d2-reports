import { DataValue } from "../../../../domain/common/entities/DataValue";
import { WidgetState } from "../WidgetFeedback";

export interface WidgetProps {
    onValueChange: (dataValue: DataValue) => void;
    disabled: boolean;
    state: WidgetState;
}
