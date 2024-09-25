export interface AuditItem {
    registerId: string;
}

export type AuditType =
    | "lowRiskMortality"
    | "zeroComorbidityMortality"
    | "cSectionMortality"
    | "emergentCase"
    | "surgeryChecklist"
    | "otMortality"
    | "acuteEmergentCase"
    | "nonSpecialistMortality"
    | "pulseOximetry"
    | "intraOperativeComplications";
