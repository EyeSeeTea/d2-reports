import React from "react";
import AdminReport from "./admin/AdminReport";
import WMRDataApprovalStatusReport from "./mal-wmr-approval-status/WMRDataApprovalStatusReport";
import NHWADataApprovalStatusReport from "./nhwa-approval-status/NHWADataApprovalStatusReport";
import NHWACommentsReport from "./nhwa-comments/NHWACommentsReport";

const widget = process.env.REACT_APP_REPORT_VARIANT || "";

const Component: React.FC = () => {
    switch (widget) {
        case "nhwa-comments": {
            return <NHWACommentsReport />;
        }
        case "nhwa-approval-status": {
            return <NHWADataApprovalStatusReport />;
        }
        case "mal-wmr-approval-status": {
            return <WMRDataApprovalStatusReport />;
        }
        case "admin": {
            return <AdminReport />;
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
