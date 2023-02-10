import { ReportType } from "../../domain/common/entities/ReportType";
import { getVariant } from "../reports/variants";

export function getReportType(): ReportType {
    const variant = getVariant();
    return variant === "mal-approval-status" ? "mal" : "nhwa";
}
