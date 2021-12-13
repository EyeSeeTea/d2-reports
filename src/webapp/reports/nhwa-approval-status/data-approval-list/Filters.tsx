import React, { useMemo } from "react";
import i18n from "../../../../locales";
import MultipleDropdown from "../../../components/dropdown/MultipleDropdown";
import { Id, NamedRef } from "../../../../domain/common/entities/Base";
import { useAppContext } from "../../../contexts/app-context";
import { getRootIds } from "../../../../domain/common/entities/OrgUnit";
import { OrgUnitsFilterButton } from "../../../components/org-units-filter/OrgUnitsFilterButton";
import styled from "styled-components";

export interface DataSetsFiltersProps {
    values: DataSetsFilter;
    options: FilterOptions;
    onChange(newFilters: DataSetsFilter): void;
}

export interface DataSetsFilter {
    dataSetIds: Id[];
    orgUnitPaths: Id[];
    periods: string[];
    completionStatus: string[];
    approvalWorkflow: string[];
}

interface FilterOptions {
    dataSets: NamedRef[];
    periods: string[];
    completionStatus: string[];
    approvalWorkflow: NamedRef[];
}

export const Filters: React.FC<DataSetsFiltersProps> = React.memo(props => {
    const { config, api } = useAppContext();
    const { values: filter, options: filterOptions, onChange } = props;

    const dataSetItems = useMemoOptionsFromNamedRef(filterOptions.dataSets);
    const rootIds = React.useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);
    const periodItems = useMemoOptionsFromStrings(filterOptions.periods);
    const completionStatusItems = useMemoOptionsFromStrings(filterOptions.completionStatus);
    const approvalWorkflowItems = useMemoOptionsFromNamedRef(filterOptions.approvalWorkflow);

    return (
        <Container>
            <MultipleDropdown
                items={dataSetItems}
                values={filter.dataSetIds}
                onChange={dataSetIds => onChange({ ...filter, dataSetIds })}
                label={i18n.t("Data sets")}
            />

            <OrgUnitsFilterButton
                api={api}
                rootIds={rootIds}
                selected={filter.orgUnitPaths}
                setSelected={paths => onChange({ ...filter, orgUnitPaths: paths })}
            />

            <Dropdown
                items={periodItems}
                values={filter.periods}
                onChange={periods => onChange({ ...filter, periods })}
                label={i18n.t("Periods")}
            />

            <Dropdown
                items={approvalWorkflowItems}
                values={filter.approvalWorkflow}
                onChange={approvalWorkflow => onChange({ ...filter, approvalWorkflow })}
                label={i18n.t("Approval workflow")}
            />

            <Dropdown
                items={completionStatusItems}
                values={filterOptions.completionStatus}
                onChange={completionStatus => onChange({ ...filter, completionStatus })}
                label={i18n.t("Completion status")}
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
`;

const Dropdown = styled(MultipleDropdown)`
    margin-left: -10px;
`;
