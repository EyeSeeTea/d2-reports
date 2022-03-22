import React from "react";
import AdminReport from "./admin/AdminReport";
import NHWACommentsReport from "./nhwa-comments/NHWACommentsReport";
import NHWADataApprovalStatusReport from "./nhwa-approval-status/NHWADataApprovalStatusReport";
import ValidateCustomFormsReport from "./validate-custom-forms/ValidateCustomFormsReport";

const widget = process.env.REACT_APP_REPORT_VARIANT || "";

const Component: React.FC = () => {
    switch (widget) {
        case "nhwa-comments": {
            return <NHWACommentsReport />;
        }
        case "nhwa-approval-status": {
            return <NHWADataApprovalStatusReport />;
        }
        case "admin": {
            return <AdminReport />;
        }
        case "validatecustomforms": {
            return <ValidateCustomFormsReport />;
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
