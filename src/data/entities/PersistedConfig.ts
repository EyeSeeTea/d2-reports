import { InvalidIndicators } from "./InvalidIndicators";
import { InvalidProgramIndicators } from "./InvalidProgramIndicators";


export interface PersistedConfig {
    indicatorsLastUpdated?: string;
    programIndicatorsLastUpdated?: string;
    indicators?: InvalidIndicators[];
    programIndicators?: InvalidProgramIndicators[];
}