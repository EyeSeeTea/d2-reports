import { ReportType } from "../../domain/common/entities/ReportType";

export function getReportType(): ReportType {
    const report = process.env.REACT_APP_REPORT_VARIANT || "";

    return report === "mal-approval-status" || report === "mal-subscription-status" ? "mal" : "nhwa";
}
