import { Typography, makeStyles, CircularProgress } from "@material-ui/core";
import _ from "lodash";
import React from "react";
import i18n from "../../../locales";
import { Select, SelectOption } from "../../components/select/Select";
import { useAppContext } from "../../contexts/app-context";

const list = ["Error ex"];

const AdminReport: React.FC = () => {
    const { compositionRoot, config } = useAppContext();
    const OnModuleChange = async ({ value }: SelectOption) => {
        //execute use case to get the CustomFormErrorsList  from a given dataset
        // eslint-disable-next-line
        debugger;
        const result = await compositionRoot.validateCustomForm.get(value);
        // eslint-disable-next-line
        // eslint-disable-next-line
        debugger;
        result.map(item => {
            list.push(item);
        });
        //list.push(result)
        //    setIsRunning(false)
        //}
        // eslint-disable-next-line
        debugger;
        return value;
    };
    const classes = useStyles();
    const [modules] = React.useState<{ value: string; label: string }[]>(
        _.values(config.dataSets).map(ds => {
            return { value: ds.id, label: ds.name };
        })
    );

    return (
        <React.Fragment>
            <h1 className={classes.title}>{i18n.t("Custom Form Validation")}</h1>

            <div className={classes.select}>
                <Select
                    placeholder={i18n.t("Select custom form to validate...")}
                    onChange={OnModuleChange}
                    options={modules}
                />
            </div>

            {<CircularProgress />}

            <div className={classes.row}>
                <Typography variant="h5">{i18n.t("Result:")}</Typography>
            </div>
            <div className={classes.row}>
                {list.forEach(item => {
                    return <p>{item}</p>;
                })}
                <p> {_.values(list)}</p>
            </div>
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    row: {
        display: "flex",
        flexFlow: "row nowrap",
        justifyContent: "space-around",
        marginRight: "1em",
        marginLeft: "1%",
    },
    title: { marginBottom: 0, marginLeft: "1%" },
    select: {
        flexBasis: "100%",
        margin: "0.5em",
        marginTop: "1em",
        flexFlow: "row nowrap",
        justifyContent: "space-around",
        marginRight: "75%",
        marginLeft: "1%",
    },
    checkbox: { marginTop: "1em" },
    fullWidth: { width: "25%" },
});

export default AdminReport;
