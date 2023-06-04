import React from "react";
import { AdminReport } from "./admin/AdminReport";
import MalDataApprovalStatusReport from "./mal-data-approval/MalDataApprovalReport";
import { NHWADataApprovalStatusReport } from "./nhwa-approval-status/NHWADataApprovalStatusReport";
import { NHWACommentsReport } from "./nhwa-comments/NHWACommentsReport";
import { WMRNationalPolicies } from "./wmr-national-policies/WMRNationalPolicies";
import GLASSDataSubmissionReport from "./glass-data-submission/GLASSDataSubmissionReport";
import CSYSummaryReport from "./csy-summary/CSYSummaryReport";
import CSYSummaryReportMortality from "./csy-summary-mortality/CSYSummaryReport";

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
        case "admin": {
            return <AdminReport />;
        }
        case "wmr-national-policies": {
            return <WMRNationalPolicies />;
        }
        case "csy-summary": {
            return <CSYSummaryReport />;
        }
        case "csy-summary-mortality": {
            return <CSYSummaryReportMortality />;
        }
        case "glass-submission": {
            return <GLASSDataSubmissionReport />;
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
