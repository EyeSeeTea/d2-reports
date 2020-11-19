import React from "react";
import { D2Api } from "../../../types/d2-api";
import { OrgUnitsSelector } from "d2-ui-components";
import { makeStyles } from "@material-ui/core";
import { Id } from "../../../domain/entities/Base";

interface OrgUnitsFilterProps {
    api: D2Api;
    rootIds: Id[];
    selected: Path[];
    setSelected(newPaths: Path[]): void;
}

type Path = string;

export const OrgUnitsFilter: React.FC<OrgUnitsFilterProps> = React.memo(props => {
    const { api, rootIds, selected, setSelected } = props;
    const classes = useStyles();

    return (
        <div key={"org-unit-selector-filter"} className={classes.orgUnitFilter}>
            <OrgUnitsSelector
                api={api}
                withElevation={true}
                controls={orgUnitsSelectorControls}
                hideCheckboxes={true}
                hideMemberCount={true}
                fullWidth={false}
                height={500}
                square={true}
                rootIds={rootIds}
                onChange={setSelected}
                selected={selected}
                singleSelection={true}
                selectOnClick={true}
                initiallyExpanded={[]}
            />
        </div>
    );
});

const orgUnitsSelectorControls = {};

const useStyles = makeStyles({
    orgUnitFilter: {
        order: -1,
        marginRight: "1rem",
    },
});
