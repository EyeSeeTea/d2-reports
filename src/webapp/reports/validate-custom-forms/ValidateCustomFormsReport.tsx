import { Typography, makeStyles } from "@material-ui/core";
import _ from "lodash";
import React, { useState } from "react";
import i18n from "../../../locales";
import { Spinner } from "../../components/objects-list/Spinner";
import { Select, SelectOption } from "../../components/select/Select";
import { useAppContext } from "../../contexts/app-context";

const errors = [{ text: "" }];
const [errros, setErrors] = React.useState<Array<{ text: string }>>([{ text: "" }]);

const ValidateCustomFormsReport: React.FC = () => {
    const [isLoading, setLoading] = useState(false);

    const { compositionRoot, config } = useAppContext();
    const OnModuleChange = async ({ value }: SelectOption) => {
        setLoading(true);
        const result = await compositionRoot.validateCustomForm.get(value);
        _.remove(errors);
        if (result.length === 0) {
            errors.push({ text: i18n.t("No errors detected") });
        }
        result.map(item => {
            return errors.push({ text: item });
        });
        setLoading(false);
        return value;
    };

    const classes = useStyles();

    const [modules] = React.useState<{ value: string; label: string }[]>(
        _.values(config.dataSets)
            .filter(ds => {
                return ds.name.indexOf("Maturity") === -1;
            })
            .map(ds => {
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

            <div className={classes.row}>
                <p>
                    <Spinner isVisible={isLoading} />
                </p>
            </div>

            <div className={classes.row}>
                <Typography variant="h5">{i18n.t("Result:")}</Typography>
            </div>

            {_.map(errors, item => {
                return <div className={classes.items}>{item.text}</div>;
            })}
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
    items: {
        display: "flex",
        flexFlow: "row nowrap",
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

export default ValidateCustomFormsReport;
