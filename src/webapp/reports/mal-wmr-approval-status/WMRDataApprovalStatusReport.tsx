import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { DataApprovalList } from "./data-approval-list/WMRDataApprovalList";

const WMRDataApprovalStatusReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("WMR Data Approval Status Report")}
            </Typography>

            <DataApprovalList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default WMRDataApprovalStatusReport;
