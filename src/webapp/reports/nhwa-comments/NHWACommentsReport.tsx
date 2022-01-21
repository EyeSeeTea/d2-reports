import { Typography, makeStyles } from "@material-ui/core";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { DataCommentsList } from "./data-comments-list/DataCommentsList";

const NHWACommentsReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("NHWA Comments Report")}
            </Typography>

            <DataCommentsList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default NHWACommentsReport;
