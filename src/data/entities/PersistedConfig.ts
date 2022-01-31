import { ValidationResults } from "../../domain/common/entities/ValidationResults";


export interface PersistedConfig {
    indicatorsLastUpdated?: string;
    programIndicatorsLastUpdated?: string;
    validationResults?: ValidationResults[];
}