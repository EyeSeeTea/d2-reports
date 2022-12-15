import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";

const DataQualityReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Data Quality Report")}
            </Typography>

            <p>hi</p>
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default DataQualityReport;
