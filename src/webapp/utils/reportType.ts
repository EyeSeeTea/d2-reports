import { ReportType } from "../../domain/common/entities/ReportType";

export function getReportType(): ReportType {
    const report = process.env.REACT_APP_REPORT_VARIANT || "";

    switch (true) {
        case report === "mal-approval-status" || report === "mal-subscription-status":
            return "mal";
        case report === "glass-submission":
            return "glass";
        case "csy-summary":
            return "summary";
        case "csy-summary-mortality":
            return "summary-mortality";
        case "csy-audit-emergency":
            return "auditEmergency";
        case report === "csy-audit-trauma":
            return "auditTrauma";
        default:
            return "nhwa";
    }
}
