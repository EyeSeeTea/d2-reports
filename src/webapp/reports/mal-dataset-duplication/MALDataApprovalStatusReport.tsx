import { Typography, makeStyles } from "@material-ui/core";
import { useEffect } from "react";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { DataApprovalList } from "./data-approval-list/DataApprovalList";

const MALDataApprovalStatusReport: React.FC = () => {
    const classes = useStyles();
    const { compositionRoot } = useAppContext();

    useEffect(() => {
        compositionRoot.dataDuplicate.generateSortOrder()
    });

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Malaria Data Approval Report")}
            </Typography>

            <DataApprovalList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default MALDataApprovalStatusReport;
