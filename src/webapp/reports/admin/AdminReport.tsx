import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { MetadataList } from "../../components/metadata-list/MetadataList";

const AdminReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Metadata Admin Report")}
            </Typography>

            <Typography variant="h4" gutterBottom>
                {i18n.t("Public Objects")}
            </Typography>
            <MetadataList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 10 },
});

export default AdminReport;
