import { DataElementTotal } from "../entities/AutoCompleteComputeSettings";

export interface AutoCompleteComputeSettingsRepository {
    get(): Promise<DataElementTotal[]>;
}
