import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { CSYAuditList } from "./csy-audit-list/CSYAuditList";

const CSYAuditReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("CSY Audit Report")}
            </Typography>

            <CSYAuditList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default CSYAuditReport;
