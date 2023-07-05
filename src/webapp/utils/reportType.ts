import { ReportType } from "../../domain/common/entities/ReportType";

export function getReportType(): ReportType {
    const report = process.env.REACT_APP_REPORT_VARIANT || "";

    switch (report) {
        case "mal-approval-status":
            return "mal";
        case "glass-submission":
            return "glass";
        case "csy-audit":
            return "audit";
        default:
            return "nhwa";
    }
}
