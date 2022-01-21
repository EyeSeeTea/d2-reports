import { ProgramIndicator } from "./ProgramIndicator";

export interface ProgramIndicatorsByExpression {
    right: ProgramIndicator[],
    wrongExpression: ProgramIndicator[],
    wrongFilter: ProgramIndicator[],
}
