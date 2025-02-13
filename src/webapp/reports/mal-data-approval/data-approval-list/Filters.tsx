import { Dropdown } from "@eyeseetea/d2-ui-components";
import React, { useMemo } from "react";
import styled from "styled-components";
import { Id, NamedRef } from "../../../../domain/common/entities/Base";
import i18n from "../../../../locales";
import MultipleDropdown from "../../../components/dropdown/MultipleDropdown";
import { useAppContext } from "../../../contexts/app-context";
import { Button } from "@material-ui/core";
import { useDataApprovalFilters } from "./hooks/useDataApprovalFilters";
import { OrgUnitsFilterButton } from "../../../components/org-units-filter/OrgUnitsFilterButton";

type DataSetsFiltersProps = {
    values: DataSetsFilter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<DataSetsFilter>>;
    hideDataSets?: boolean;
};

export interface DataSetsFilter {
    dataSetId: Id | undefined;
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
    const { api } = useAppContext();
    const { hideDataSets, options: filterOptions } = props;

    const { filterValues, rootIds, selectableIds, setFilterValues, applyFilters, clearFilters } =
        useDataApprovalFilters(props);
    useDataApprovalFilters(props);

    const dataSetItems = useMemoOptionsFromNamedRef(filterOptions.dataSets);
    const periodItems = useMemoOptionsFromStrings(filterOptions.periods);

    const completionStatusItems = useMemo(() => {
        return [
            { value: "true", text: i18n.t("Completed") },
            { value: "false", text: i18n.t("Not completed") },
        ];
    }, []);

    const approvalStatusItems = useMemo(() => {
        return [
            { value: "true", text: i18n.t("Submitted") },
            { value: "false", text: i18n.t("Ready for submission") },
        ];
    }, []);

    return (
        <>
            <Container>
                {!hideDataSets && (
                    <DataSetDropdown
                        items={dataSetItems}
                        value={filterValues.dataSetId}
                        onChange={setFilterValues.dataSetId}
                        label={i18n.t("Data sets")}
                    />
                )}

                <OrgUnitsFilterButton
                    api={api}
                    rootIds={rootIds}
                    setSelected={setFilterValues.orgUnitPaths}
                    selected={filterValues.orgUnitPaths}
                    selectableIds={selectableIds}
                    selectableLevels={[1, 2, 3]}
                />

                <DropdownStyled
                    items={periodItems}
                    values={filterValues.periods}
                    onChange={setFilterValues.periods}
                    label={i18n.t("Periods")}
                />

                <SingleDropdownStyled
                    items={completionStatusItems}
                    value={fromBool(filterValues.completionStatus)}
                    onChange={setFilterValues.completionStatus}
                    label={i18n.t("Completion status")}
                />

                <SingleDropdownStyled
                    items={approvalStatusItems}
                    value={fromBool(filterValues.approvalStatus)}
                    onChange={setFilterValues.approvalStatus}
                    label={i18n.t("Submission status")}
                />
            </Container>

            <FilterButtonContainer>
                <Button disabled={!filterValues.dataSetId} onClick={applyFilters} variant="contained" color="primary">
                    {i18n.t("Apply filters")}
                </Button>

                <Button onClick={clearFilters} variant="contained">
                    {i18n.t("Clear filters")}
                </Button>
            </FilterButtonContainer>
        </>
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

const DropdownStyled = styled(MultipleDropdown)`
    margin-left: -10px;
`;

const SingleDropdownStyled = styled(Dropdown)`
    margin-left: -10px;
    width: 180px;
`;

const DataSetDropdown = styled(Dropdown)`
    margin-left: -10px;
    width: 260px;
`;

const FilterButtonContainer = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: end;
    width: 100%;
`;

function fromBool(value: boolean | undefined): string | undefined {
    return value === undefined ? undefined : value.toString();
}
