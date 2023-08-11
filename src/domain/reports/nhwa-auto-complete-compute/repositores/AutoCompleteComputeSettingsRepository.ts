import { AutoCompleteComputeSettings } from "../entities/AutoCompleteComputeSettings";

export interface AutoCompleteComputeSettingsRepository {
    get(): Promise<AutoCompleteComputeSettings>;
}
