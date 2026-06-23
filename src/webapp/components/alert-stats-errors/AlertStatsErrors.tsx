import _ from "lodash";
import React from "react";
import styled from "styled-components";
import { Button } from "@material-ui/core";
import { NamedRef } from "../../../domain/common/entities/Base";
import { OrgUnit } from "../../../domain/common/entities/OrgUnit";
import { Stats } from "../../../domain/common/entities/Stats";
import { Alert } from "../alert/Alert";

type AlertStatsErrorsProps = {
    errors?: Stats["errorMessages"];
    onCleanError: () => void;
    orgUnits: OrgUnit[];
    dataSets?: NamedRef[];
};

// DHIS2 import conflict messages reference metadata by UID (e.g. ``data set: `Tu81BTLUuCT` ...
// org unit: `e9IoKRAkYLO```). Replace every backtick-wrapped UID we know about with its name,
// regardless of the surrounding label wording (which varies between DHIS2 versions).
function replaceIdsByNames(message: string, items: NamedRef[]): string {
    return _(items).reduce((acc, item) => acc.split(`\`${item.id}\``).join(`\`${item.name}\``), message);
}

export const AlertStatsErrors: React.FC<AlertStatsErrorsProps> = props => {
    const { errors, onCleanError, orgUnits, dataSets = [] } = props;

    if (!errors) return null;

    const namedRefs = [...orgUnits, ...dataSets];

    return (
        <>
            <Button variant="contained" color="secondary" size="small" onClick={() => onCleanError()}>
                Clear Errors
            </Button>
            <AlertContainer>
                {errors.map((error, index) => {
                    return <Alert key={index} message={replaceIdsByNames(error.message, namedRefs)} />;
                })}
            </AlertContainer>
        </>
    );
};

const AlertContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    padding: 0.5em 0;
`;
