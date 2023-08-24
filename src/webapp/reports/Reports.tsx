import React from "react";
import { AdminReport } from "./admin/AdminReport";
import DataQualityReport from "./data-quality/DataQualityReport";
import MalDataApprovalStatusReport from "./mal-data-approval/MalDataApprovalReport";
import MalDataSubscriptionStatusReport from "./mal-data-subscription/MalDataSubscriptionReport";
import { NHWADataApprovalStatusReport } from "./nhwa-approval-status/NHWADataApprovalStatusReport";
import { NHWACommentsReport } from "./nhwa-comments/NHWACommentsReport";
import { WMRNationalPolicies } from "./wmr-national-policies/WMRNationalPolicies";
import CSYAuditEmergencyReport from "./csy-audit-emergency/CSYAuditEmergencyReport";
import GLASSDataSubmissionReport from "./glass-data-submission/GLASSDataSubmissionReport";
import CSYSummaryReport from "./csy-summary-patient/CSYSummaryReport";
import CSYSummaryReportMortality from "./csy-summary-mortality/CSYSummaryReport";
import CSYAuditTraumaReport from "./csy-audit-trauma/CSYAuditTraumaReport";
import { NHWAAutoCompleteCompute } from "./nhwa-auto-complete-compute/NHWAAutoCompleteCompute";
import { NHWAFixTotals } from "./nhwa-fix-totals-activity-level/NHWAFixTotals";
import { NHWASubnationalCorrectOrgUnit } from "./nhwa-subnational-correct-orgunit/NHWASubnationalCorrectOrgUnit";

const widget = process.env.REACT_APP_REPORT_VARIANT || "";

const Component: React.FC = () => {
    switch (widget) {
        case "nhwa-comments": {
            return <NHWACommentsReport />;
        }
        case "nhwa-approval-status": {
            return <NHWADataApprovalStatusReport />;
        }
        case "mal-approval-status": {
            return <MalDataApprovalStatusReport />;
        }
        case "mal-subscription-status": {
            return <MalDataSubscriptionStatusReport />;
        }
        case "admin": {
            return <AdminReport />;
        }
        case "wmr-national-policies": {
            return <WMRNationalPolicies />;
        }
        case "csy-audit-emergency": {
            return <CSYAuditEmergencyReport />;
        }
        case "csy-audit-trauma": {
            return <CSYAuditTraumaReport />;
        }
        case "csy-summary-patient": {
            return <CSYSummaryReport />;
        }
        case "csy-summary-mortality": {
            return <CSYSummaryReportMortality />;
        }
        case "glass-submission": {
            return <GLASSDataSubmissionReport />;
        }
        case "data-quality": {
            return <DataQualityReport />;
        }
        case "nhwa-auto-complete-compute": {
            return <NHWAAutoCompleteCompute />;
        }
        case "nhwa-fix-totals-activity-level": {
            return <NHWAFixTotals />;
        }
        case "nhwa-subnational-correct-orgunit": {
            return <NHWASubnationalCorrectOrgUnit />;
        }
        default: {
            return <p>{`Please provide a valid REACT_APP_REPORT_VARIANT`}</p>;
        }
    }
};

function Reports() {
    return <Component />;
}

export default Reports;
