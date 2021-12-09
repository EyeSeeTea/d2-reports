import React from "react";
import AdminReport from "./admin/AdminReport";
import NHWACommentsReport from "./nhwa-comments/NHWACommentsReport";
import NHWADataStatusReport from "./nhwa-data-status/NHWADataStatusReport";

const widget = process.env.REACT_APP_REPORT_VARIANT || "";

const Component: React.FC = () => {
    switch (widget) {
        case "nhwa-comments": {
            return <NHWACommentsReport />;
        }
        case "nhwa-data-status": {
            return <NHWADataStatusReport />;
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
