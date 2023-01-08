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

export interface DataQualityConfig {
    indicatorsLastUpdated: string;
    programIndicatorsLastUpdated: string;
    validationResults: DataQualityItem[];
}
