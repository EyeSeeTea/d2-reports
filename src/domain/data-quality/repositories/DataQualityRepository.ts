import { IndicatorsByExpression } from "../../common/entities/IndicatorsByExpression";
import { ProgramIndicatorsByExpression } from "../../common/entities/ProgramIndicatorsByExpression";

export interface DataQualityRepository {
    getIndicatorByExpressions(lastUpdated: string): Promise<IndicatorsByExpression>;
    getProgramIndicatorByExpressions(lastUpdated: string): Promise<ProgramIndicatorsByExpression>;
    getLastUpdated(key: string): string;
    saveIndicators(lastUpdated: string, indicators: IndicatorsByExpression): Promise<void>;
    saveProgramIndicators(lastUpdated: string, programIndicators: ProgramIndicatorsByExpression): Promise<void>;
}


export interface DataQualityRepositoryGetOptions {
    indicators: boolean;
    programIndicators: boolean;
    indicatorLastUpdated: string;
    programIndicatorsLastUpdated: string;
}

export interface DataQualityRepositorySaveOptions {
    indicators?: IndicatorsByExpression,
    programIndicators?: ProgramIndicatorsByExpression
    indicatorLastUpdated: string;
    programIndicatorsLastUpdated: string;
}