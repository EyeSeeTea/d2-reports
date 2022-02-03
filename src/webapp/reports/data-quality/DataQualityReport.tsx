import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { InvalidProgramIndicatorsList } from "./metadata-list/InvalidProgramIndicatorsList";
import { InvalidIndicatorsList } from "./metadata-list/InvalidIndicatorsList";

const DataQualityReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>

            <Typography variant="h5" gutterBottom>
                {i18n.t("Data quality")}
            </Typography>

            <Typography variant="h6" gutterBottom>
                {i18n.t("Indicators")}
            </Typography>
            <InvalidIndicatorsList />

            <Typography variant="h6" gutterBottom>
                {i18n.t("ProgramIndicators")}
            </Typography>
            <InvalidProgramIndicatorsList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 10 },
});

export default DataQualityReport;
