import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { FileResourcesMonitorList } from "./file-resources-list/FileResourcesList";

export const FileResourcesMonitoringReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("File resources Monitoring")}
            </Typography>

            <FileResourcesMonitorList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});
