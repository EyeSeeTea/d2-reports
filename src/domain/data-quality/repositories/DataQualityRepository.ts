import { ValidationResults } from "../../common/entities/ValidationResults";

export interface DataQualityRepository {
    getValidations(): Promise<ValidationResults>;
    exportToCsv(filename: string, metadataObjects: ValidationResults[]): Promise<void>;
}


export interface DataQualityRepositoryGetOptions {
    indicators: boolean;
    programIndicators: boolean;
}

export interface DataQualityRepositorySaveOptions {
    indicators?: ValidationResults,
    programIndicators?: ValidationResults
    indicatorLastUpdated: string;
    programIndicatorsLastUpdated: string;
}