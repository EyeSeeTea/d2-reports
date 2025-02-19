import { Typography, makeStyles } from "@material-ui/core";
import { useEffect } from "react";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { DataApprovalList } from "./data-approval-list/DataApprovalList";

const MalDataApprovalStatusReport: React.FC = () => {
    const classes = useStyles();
    const { compositionRoot } = useAppContext();

    useEffect(() => {
        compositionRoot.malDataApproval.generateSortOrder();
    });

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Malaria Data Approval Report")}
            </Typography>

            <DataApprovalList dataSetCode="0MAL_5" />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default MalDataApprovalStatusReport;
