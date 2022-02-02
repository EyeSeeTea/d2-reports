import { ValidationResults } from "../../../domain/common/entities/ValidationResults";

export interface DataQualityReportProgramIndicatorViewModel {
    id: string;
    name: string;
    metadataType: string;
    filter?: string;
    expression?: string;
    filterresult?: string;
    expressionrresult?: string;
    createdBy: string;
    lastUpdated: string;
}

export function getDataQualityReportProgramIndicatorViews(validationResults: ValidationResults[]): DataQualityReportProgramIndicatorViewModel[] {
    return validationResults.filter(item => item.metadataType === "ProgramIndicator" && (item.filterResult == false || item.expressionResult == false)).map(validationResult => {
        return {
            id: validationResult.id,
            name: validationResult.name,
            metadataType: validationResult.metadataType ?? "-",
            filter: validationResult.filter,
            expression: validationResult.expression,
            filterresult: validationResult.filterresult ? "valid": "invalid",
            expressionrresult: validationResult.expressionresult ? "valid": "invalid",
            createdBy: validationResult.user ?? "-",
            lastUpdated: validationResult.lastUpdated ?? "-",
        };
    });
}
