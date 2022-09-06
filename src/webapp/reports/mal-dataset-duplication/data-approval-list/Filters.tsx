import React, { useMemo } from "react";
import styled from "styled-components";
import { Id, NamedRef } from "../../../../domain/common/entities/Base";
import { getRootIds } from "../../../../domain/common/entities/OrgUnit";
import i18n from "../../../../locales";
import MultipleDropdown from "../../../components/dropdown/MultipleDropdown";
import { OrgUnitsFilterButton } from "../../../components/org-units-filter/OrgUnitsFilterButton";
import { useAppContext } from "../../../contexts/app-context";

export interface DataSetsFiltersProps {
    values: DataSetsFilter;
    options: FilterOptions;
    onChange(newFilters: DataSetsFilter): void;
}

export interface DataSetsFilter {
    dataSetIds: Id[];
    orgUnitPaths: Id[];
    periods: string[];
    completionStatus?: boolean;
    approvalStatus?: boolean;
}

interface FilterOptions {
    dataSets: NamedRef[];
    periods: string[];
}

export const Filters: React.FC<DataSetsFiltersProps> = React.memo(props => {
    const { config, api } = useAppContext();
    const { values: filter, options: filterOptions, onChange } = props;

    const dataSetItems = useMemoOptionsFromNamedRef(filterOptions.dataSets);
    const rootIds = React.useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);
    const periodItems = useMemoOptionsFromStrings(filterOptions.periods);

    const completionStatusItems = useMemoOptionsFromNamedRef([
        { id: "true", name: "Completed" },
        { id: "false", name: "Not completed" },
    ]);

    const approvalStatusItems = useMemoOptionsFromNamedRef([
        { id: "true", name: "Submitted" },
        { id: "false", name: "Ready for submission" },
    ]);


    return (
        <Container>
            <OrgUnitsFilterButton
                api={api}
                rootIds={rootIds}
                selected={filter.orgUnitPaths}
                setSelected={paths => onChange({ ...filter, orgUnitPaths: paths })}
            />

            <Dropdown
                items={dataSetItems}
                values={filter.dataSetIds}
                onChange={dataSetIds => onChange({ ...filter, dataSetIds })}
                label={i18n.t("Data sets")}
            />

            <Dropdown
                items={periodItems}
                values={filter.periods}
                onChange={periods => onChange({ ...filter, periods })}
                label={i18n.t("Periods")}
            />

            <Dropdown
                items={completionStatusItems}
                values={fromBool(filter.completionStatus)}
                onChange={([completionStatus]) => onChange({ ...filter, completionStatus: toBool(completionStatus) })}
                label={i18n.t("Completion status")}
                multiple={false}
            />

            <Dropdown
                items={approvalStatusItems}
                values={fromBool(filter.approvalStatus)}
                onChange={([approvalStatus]) => onChange({ ...filter, approvalStatus: toBool(approvalStatus) })}
                label={i18n.t("Submission status")}
                multiple={false}
            />

        </Container>
    );
});

function useMemoOptionsFromStrings(options: string[]) {
    return useMemo(() => {
        return options.map(option => ({ value: option, text: option }));
    }, [options]);
}

function useMemoOptionsFromNamedRef(options: NamedRef[]) {
    return useMemo(() => {
        return options.map(option => ({ value: option.id, text: option.name }));
    }, [options]);
}

const Container = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;

const Dropdown = styled(MultipleDropdown)`
    margin-left: -10px;
`;

function toBool(s: string | undefined): boolean | undefined {
    return s === undefined ? undefined : s === "true";
}

function fromBool(value: boolean | undefined): string[] {
    return value === undefined ? [] : [value.toString()];
}
