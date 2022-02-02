import { ValidationResults } from "../../../domain/common/entities/ValidationResults";

export interface DataQualityReportIndicatorViewModel {
    id: string;
    name: string;
    metadataType: string;
    denominator?: string;
    numerator?: string;
    denominatorresult?: string;
    numeratorresult?: string;
    createdBy: string;
    lastUpdated: string;
}

export function getDataQualityReportIndicatorViews(validationResults: ValidationResults[]): DataQualityReportIndicatorViewModel[] {
    return validationResults.filter(item => item.metadataType === "Indicator" && (item.numeratorresult == false || item.denominatorresult == false)).map(validationResult => {
        return {
            id: validationResult.id,
            name: validationResult.name,
            metadataType: validationResult.metadataType ?? "-",
            numerator: validationResult.numerator,
            denominator: validationResult.denominator,
            numeratorresult: validationResult.numeratorresult ? "valid": "invalid",
            denominatorresult: validationResult.denominatorresult ? "valid": "invalid",
            createdBy: validationResult.user ?? "-",
            lastUpdated: validationResult.lastUpdated ?? "-",
        };
    });
}
