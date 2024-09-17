import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { CSYAuditOperativeList } from "./csy-audit-operative-list/CSYAuditOperativeList";

const CSYAuditOperativeReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("CSY Audit Filters - Operative Care")}
            </Typography>

            <CSYAuditOperativeList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default CSYAuditOperativeReport;
