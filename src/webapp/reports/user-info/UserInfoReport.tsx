import { Typography, makeStyles } from "@material-ui/core";
import i18n from "../../../locales";
import { UserInfoList } from "./user-info-list/UserInfoList";

export const UserInfoReport: React.FC = () => {
    const classes = useStyles();

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Uset 2FA info")}
            </Typography>

            <UserInfoList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});
