import { Typography, makeStyles } from "@material-ui/core";
import { useEffect } from "react";
import i18n from "../../../locales";
import { useAppContext } from "../../contexts/app-context";
import { DataSubscriptionList } from "./data-approval-list/DataSubscriptionList";

const MalDataSubscriptionStatusReport: React.FC = () => {
    const classes = useStyles();
    const { compositionRoot } = useAppContext();

    useEffect(() => {
        compositionRoot.malDataSubscription.generateSortOrder();
    });

    return (
        <div className={classes.wrapper}>
            <Typography variant="h5" gutterBottom>
                {i18n.t("Malaria Data Subscription Report")}
            </Typography>

            <DataSubscriptionList />
        </div>
    );
};

const useStyles = makeStyles({
    wrapper: { padding: 20 },
});

export default MalDataSubscriptionStatusReport;
