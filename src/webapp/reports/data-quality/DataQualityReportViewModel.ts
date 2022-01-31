import { ValidationResults } from "../../../domain/common/entities/ValidationResults";

export interface DataQualityReportViewModel {
    id: string;
    name: string;
    metadataType: string;
    denominator?: string;
    numerator?: string;
    filter?: string;
    expression?: string;
    denominatorresult?: boolean;
    numeratorresult?: boolean;
    filterresult?: boolean;
    expressionrresult?: boolean;
    createdBy: string;
    lastUpdated: string;
}

export function getDataQualityReportViews(validationResults: ValidationResults[]): DataQualityReportViewModel[] {
    return validationResults.map(validationResult => {
        return {
            id: validationResult.id,
            name: validationResult.name,
            metadataType: validationResult.metadataType ?? "-",
            numerator: validationResult.numerator,
            denominator: validationResult.denominator,
            filter: validationResult.filter,
            expression: validationResult.expression,
            numeratorresult: validationResult.numeratorresult,
            denominatorresult: validationResult.denominatorresult,
            filterresult: validationResult.filterresult,
            expressionrresult: validationResult.expressionresult,
            createdBy: validationResult.user ?? "-",
            lastUpdated: validationResult.lastUpdated ?? "-",
        };
    });
}
