export interface AuditItem {
    registerId: string;
}

export type AuditType =
    | "mortality"
    | "hypoxia"
    | "tachypnea"
    | "mental"
    | "all-mortality"
    | "emergency-unit"
    | "hospital-mortality"
    | "severe-injuries"
    | "moderate-injuries"
    | "moderate-severe-injuries";
