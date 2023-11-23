import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { DataAttachmentsList } from "./data-attachment-list/DataAttachmentsList";

const NHWAAttachmentReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("NHWA Attachment Report")}
            </Typography>

            <DataAttachmentsList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default NHWAAttachmentReport;
