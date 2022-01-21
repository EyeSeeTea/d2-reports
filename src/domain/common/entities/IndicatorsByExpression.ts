import { Indicator } from "./Indicator";

export interface IndicatorsByExpression {
    right: Indicator[],
    wrongNumerator: Indicator[],
    wrongDenominator: Indicator[],
    wrongFilter: Indicator[],
}
