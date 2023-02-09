export interface DataQualityItem {
    id: string;
    lastUpdated: string;
    metadataType: string;
    name: string;
    user: string;

    denominator?: string;
    denominatorresult?: boolean;
    numerator?: string;
    numeratorresult?: boolean;
    expression?: string;
    expressionresult?: boolean;
    filter?: string;
    filterresult?: boolean;
}

export interface IndicatorItem {
    id: string;
    lastUpdated: string;
    metadataType: string;
    name: string;
    user: string;
    denominator: string;
    denominatorresult: boolean;
    numerator: string;
    numeratorresult: boolean;
}

export interface ProgramIndicatorItem {
    id: string;
    lastUpdated: string;
    metadataType: string;
    name: string;
    user: string;
    expression: string;
    expressionresult: boolean;
    filter: string;
    filterresult: boolean;
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
