import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { DataSetList } from "../../components/data-set-list/DataSetList";

const NHWADataStatusReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("NHWA Data Status Report")}
            </Typography>

            <DataSetList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 10 },
});

export default NHWADataStatusReport;
