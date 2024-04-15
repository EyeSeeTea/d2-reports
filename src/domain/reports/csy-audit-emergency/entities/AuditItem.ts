export interface AuditItem {
    registerId: string;
}

export type AuditType = "overall-mortality" | "low-acuity" | "highest-triage" | "initial-rbg" | "shock-ivf";
