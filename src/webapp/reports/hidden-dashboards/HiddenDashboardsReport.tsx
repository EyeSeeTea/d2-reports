import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { HiddenDashboardList } from "./hidden-dashboards-list/HiddenDashboardList";

const HiddenDashboardsReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>

            <Typography variant="h6" gutterBottom>
                {i18n.t("Hidden dashboards")}
            </Typography>
            <HiddenDashboardList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 10 },
});

export default HiddenDashboardsReport;
