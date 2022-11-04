import React from "react";
import { AdminReport } from "./admin/AdminReport";
import MalDataApprovalStatusReport from "./mal-data-approval/MalDataApprovalReport";
import { NHWADataApprovalStatusReport } from "./nhwa-approval-status/NHWADataApprovalStatusReport";
import { NHWACommentsReport } from "./nhwa-comments/NHWACommentsReport";
import { UserInfoReport } from "./user-info/UserInfoReport";
import { WMRNationalPolicies } from "./wmr-national-policies/WMRNationalPolicies";

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
        case "user-info": {
            return <UserInfoReport />;
        }
        case "wmr-national-policies": {
            return <WMRNationalPolicies />;
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
