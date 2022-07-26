import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { ValidateYesNoPartialList } from "./metadata-list/ValidateYesNoPartialList";

const AdminReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Validate yes no partial")}
            </Typography>

            <Typography variant="h6" gutterBottom>
                {i18n.t("Objects with invalid sharing settings")}
            </Typography>
            <ValidateYesNoPartialList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 10 },
});

export default AdminReport;
