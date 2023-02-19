export interface IndicatorItem {
    id: string;
    lastUpdated: string;
    metadataType: string;
    name: string;
    user: string;
    denominator: string;
    denominatorResult: boolean;
    numerator: string;
    numeratorResult: boolean;
}

export interface ProgramIndicatorItem {
    id: string;
    lastUpdated: string;
    metadataType: string;
    name: string;
    user: string;
    expression: string;
    expressionResult: boolean;
    filter: string;
    filterResult: boolean;
}

export interface IndicatorConfig {
    indicatorsLastUpdated: string;
    programIndicatorsLastUpdated: string;
    validationResults: IndicatorItem[];
}

export interface ProgramIndicatorConfig {
    indicatorsLastUpdated: string;
    programIndicatorsLastUpdated: string;
    validationResults: ProgramIndicatorItem[];
}
