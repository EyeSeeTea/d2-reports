import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { HiddenDashboardList } from "./visualization-list/HiddenDashboardList";
import { HiddenVisualizationList } from "./visualization-list/HiddenVisualizationList";

const VisualizationReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Data quality")}
            </Typography>

            <Typography variant="h6" gutterBottom>
                {i18n.t("Hidden visualizations")}
            </Typography>
            <HiddenVisualizationList />

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

export default VisualizationReport;
