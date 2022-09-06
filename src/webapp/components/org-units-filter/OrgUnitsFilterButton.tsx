import React, { useCallback, useState } from "react";
import { OrgUnitsFilter, OrgUnitsFilterProps } from "./OrgUnitsFilter";
import { makeStyles } from "@material-ui/core";
import { ConfirmationDialog, OrgUnitsSelector } from "@eyeseetea/d2-ui-components";
import { useAppContext } from "../../contexts/app-context";
import i18n from "../../../locales";
import { useBooleanState } from "../../utils/use-boolean";
//import { TextField } from "material-ui";

export interface OrgUnitsFilterButtonProps extends OrgUnitsFilterProps {}


export const OrgUnitsFilterButton: React.FC<OrgUnitsFilterButtonProps> = React.memo(props => {
    const { api, compositionRoot } = useAppContext();
    const [isDialogOpen, { enable: openDialog, disable: closeDialog }] = useBooleanState(false);
//    const [selectedOrgUnits, setSelectedOrgUnits] = useState(loadingMessage);
    const [selectedOrgUnits, setSelectedOrgUnits] = useState<string[]>([]);
    const [orgUnitTreeRootIds, setOrgUnitTreeRootIds] = useState<string[]>([]);
    const [orgUnitTreeFilter, setOrgUnitTreeFilter] = useState<string[]>([]);

const isMultipleSelection = true;
const useStyles = makeStyles({
    row: {
        display: "flex",
        flexFlow: "row nowrap",
        justifyContent: "space-around",
        marginRight: "1em",
    },
    title: { marginBottom: 0 },
    select: { flexBasis: "100%", margin: "0.5em", marginLeft: 0, marginTop: "1em" },
    checkbox: { marginTop: "1em" },
    orgUnitSelector: { marginTop: "1em", marginBottom: "2em" },
    fullWidth: { width: "100%" },
    orgUnitError: {
        height: 250,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
});
const classes = useStyles();
const onOrgUnitChange = (orgUnitPaths: string[]) => {
    setSelectedOrgUnits(orgUnitPaths);
};
    const clearSelectedOrgUnits = useCallback(() => {
        props.setSelected([]);
    }, [props]);
/* 
    useEffect(() => {
        setSelectedOrgUnits(loadingMessage);
        compositionRoot.orgUnits
            .get({ paths: props.selected })
            .then(orgUnits => setSelectedOrgUnits(orgUnits.map(ou => ou.name).join(", ")))
            .catch(() => setSelectedOrgUnits(props.selected.join(", ")));
    }, [compositionRoot, props.selected, loadingMessage]); */



    useEffect(() => {
        const { type, id } = state;
        if (type && id) {
            compositionRoot.orgUnits.getRootsByForm(type, id).then(setOrgUnitTreeFilter);
        }
    }, [state, compositionRoot]);

    useEffect(() => {
        compositionRoot.me.getUserRoots().then(setOrgUnitTreeRootIds);
    }, [compositionRoot]);


    return (
        <React.Fragment>
            <span onClick={openDialog} style={styles.textField}>
{/*                 <TextField
                    title={selectedOrgUnits}
                    value={selectedOrgUnits}
                    onChange={closeDialog}
                    floatingLabelText={i18n.t("Organisation unit")}
                /> */}
            </span>

            <ConfirmationDialog
                isOpen={isDialogOpen}
                title={i18n.t("Select parent organisation unit")}
                onCancel={closeDialog}
                onInfoAction={clearSelectedOrgUnits}
                cancelText={i18n.t("Close")}
                infoActionText={i18n.t("Clear")}
                maxWidth="md"
                fullWidth
            > 
                    <div className={classes.orgUnitSelector}>
                        <OrgUnitsSelector
                            api={api}
                            rootIds={orgUnitTreeRootIds}
                            selectableIds={orgUnitTreeFilter}
                            selected={selectedOrgUnits}
                            onChange={onOrgUnitChange}
                            fullWidth={false}
                            height={250}
                            controls={{
                                filterByLevel: isMultipleSelection,
                                filterByGroup: isMultipleSelection,
                                selectAll: isMultipleSelection,
                            }}
                            withElevation={false}
                            singleSelection={!isMultipleSelection}
                            typeInput={isMultipleSelection ? undefined : "radio"}
                        />
                    </div> 
                <OrgUnitsFilter {...props} />
            </ConfirmationDialog>
        </React.Fragment>
    );
});

const styles = {
    textField: { display: "inline-flex", marginTop: -24 },
};
