import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { TwoFactorMonitorList } from "./two-factor-list/TwoFactorList";

export const TwoFactorMonitorReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Uset 2FA info")}
            </Typography>

            <TwoFactorMonitorList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});
