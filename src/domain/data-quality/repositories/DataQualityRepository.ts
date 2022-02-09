import { ValidationResults } from "../../common/entities/ValidationResults";

export interface DataQualityRepository {
    getValidations(): Promise<ValidationResults[]>;
    reloadValidations(): Promise<ValidationResults[]>;
    exportToCsv(): Promise<void>;
}
