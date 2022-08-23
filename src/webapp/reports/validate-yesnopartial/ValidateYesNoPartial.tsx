import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { ValidateYesNoPartialList } from "./metadata-list/ValidateYesNoPartialList";

const AdminReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Yes No Partial Validation")}
            </Typography>
            <ValidateYesNoPartialList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 10 },
});

export default AdminReport;
