import { ReportType } from "../../domain/common/entities/ReportType";

export function getReportType(): ReportType {
    const report = process.env.REACT_APP_REPORT_VARIANT || "";

    return report === "mal-approval-status" ? "mal" : report === "glass-submission" ? "glass" : "nhwa";
}
