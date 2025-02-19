import { MalDataSet } from "../../../../domain/reports/mal-data-approval/entities/MalDataApprovalItem";

export const malDataSetCodes: Record<MalDataSet, string> = {
    "MAL - WMR Form": "0MAL_5",
    "MAL - Antimalarial drug policy": "MAL-ADP",
    "MAL - WMR National Policies": "MAL-WMR-NP",
    "MAL - Malaria Free": "MAL-PR-SF",
};

// use correct approved dataset codes
export const malApprovedDataSetCodes: Record<MalDataSet, string> = {
    "MAL - WMR Form": "0MAL_5_APVD",
    "MAL - Antimalarial drug policy": "MAL-ADP",
    "MAL - WMR National Policies": "MAL-WMR-NP",
    "MAL - Malaria Free": "MAL-PR-SF",
};
