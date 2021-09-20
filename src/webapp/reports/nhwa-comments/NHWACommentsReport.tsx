import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { DataValuesList } from "../../components/data-values-list/DataValuesList";

const NHWACommentsReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("NHWA Comments Report")}
            </Typography>

            <DataValuesList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 10 },
});

export default NHWACommentsReport;
