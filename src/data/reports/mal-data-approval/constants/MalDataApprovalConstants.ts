export const malDataSetCodes = {
    "MAL - WMR Form": "0MAL_5",
    "MAL - Antimalarial drug policy": "MAL-ADP",
    "MAL - WMR National Policies": "MAL-WMR-NP",
    "MAL - Malaria Free": "MAL-PR-SF",
};

// use correct approved dataset codes
export const malApprovedDataSetCodes = {
    "MAL - WMR Form": "0MAL_5_APVD",
    "MAL - Antimalarial drug policy": "MAL-ADP",
    "MAL - WMR National Policies": "MAL-WMR-NP",
    "MAL - Malaria Free": "MAL-PR-SF",
};

export type MalDataSet = keyof typeof malDataSetCodes;
