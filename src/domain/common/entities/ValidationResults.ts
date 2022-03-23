export interface ValidationResults {
    metadataType: string;
    id: string;
    name: string;
    expression?: string | undefined;
    numerator?: string | undefined;
    denominator?: string | undefined;
    filter?: string | undefined;
    expressionresult?: boolean | undefined;
    numeratorresult?: boolean | undefined;
    denominatorresult?: boolean | undefined;
    filterresult?: boolean | undefined;
    user: string;
    lastUpdated: string;
}
