export const malDataSetCodes: Record<MalDataSet, string> = {
    "MAL - WMR Form": "0MAL_5",
    "MAL - Antimalarial drug policy": "MAL-ADP",
    "MAL - WMR National Policies": "MAL-WMR-NP",
    "MAL - Malaria Free": "MAL-PR-SF",
};

export const malariaDataSets = [
    "MAL - WMR Form",
    "MAL - Antimalarial drug policy",
    "MAL - WMR National Policies",
    "MAL - Malaria Free",
] as const;

export type MalDataSet = typeof malariaDataSets[number];

// use correct approved dataset name/codes
export const malApvdDataSets: Record<MalDataSet, string> = {
    "MAL - WMR Form": "MAL - WMR Form-APVD",
    "MAL - Antimalarial drug policy": "MAL-ADP",
    "MAL - WMR National Policies": "MAL-WMR-NP",
    "MAL - Malaria Free": "MAL-PR-SF",
};
