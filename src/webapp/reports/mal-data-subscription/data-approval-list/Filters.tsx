import { Dropdown, DropdownProps, MultipleDropdownProps } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Id, NamedRef } from "../../../../domain/common/entities/Base";
import { getOrgUnitsFromId, getRootIds } from "../../../../domain/common/entities/OrgUnit";
import i18n from "../../../../locales";
import { D2Api } from "../../../../types/d2-api";
import MultipleDropdown from "../../../components/dropdown/MultipleDropdown";
import {
    OrgUnitsFilterButton,
    OrgUnitsFilterButtonProps,
} from "../../../components/org-units-filter/OrgUnitsFilterButton";
import { useAppContext } from "../../../contexts/app-context";

export interface DataSetsFiltersProps {
    values: DataSetsFilter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<DataSetsFilter>>;
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

interface OrgUnit {
    id: Id;
    path: string;
    name: string;
    level: number;
    children: {
        level: number;
        path: string;
    }[];
}

export const Filters: React.FC<DataSetsFiltersProps> = React.memo(props => {
    const { config, api } = useAppContext();
    const { values: filter, options: filterOptions, onChange } = props;

    const dataSetItems = useMemoOptionsFromNamedRef(filterOptions.dataSets);

    const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
    const dataSetOrgUnits = getOrgUnitsFromId(config.orgUnits, orgUnits);
    const selectableOUs = _.union(
        orgUnits.filter(org => org.level < 3),
        dataSetOrgUnits
    );
    const selectableIds = selectableOUs.map(ou => ou.id);
    const rootIds = React.useMemo(() => getRootIds(selectableOUs), [selectableOUs]);


    const approvalStatusItems = React.useMemo(() => {
        return [
            { value: "true", text: i18n.t("Submitted") },
            { value: "false", text: i18n.t("Ready for submission") },
        ];
    }, []);

    useEffect(() => {
        async function getOrganisationUnits(api: D2Api, levels: string[]): Promise<OrgUnit[]> {
            const { organisationUnits } = await api.metadata
                .get({
                    organisationUnits: {
                        filter: { level: { in: levels } },
                        fields: {
                            id: true,
                            path: true,
                            name: true,
                            level: true,
                            children: { level: true, path: true },
                        },
                    },
                })
                .getData();

            return _.orderBy(organisationUnits, "level", "asc");
        }

        const levels = ["1", "2", "3"];
        getOrganisationUnits(api, levels).then(value => setOrgUnits(value));
    }, [api]);

    const { orgUnitPaths } = filter;
    const orgUnitsByPath = React.useMemo(() => _.keyBy(orgUnits, ou => ou.path), [orgUnits]);

    const setOrgUnitPaths = React.useCallback<OrgUnitsFilterButtonProps["setSelected"]>(
        newSelectedPaths => {
            const prevSelectedPaths = orgUnitPaths;
            const addedPaths = _.difference(newSelectedPaths, prevSelectedPaths);
            const removedPaths = _.difference(prevSelectedPaths, newSelectedPaths);

            const pathsToAdd = _.flatMap(addedPaths, addedPath => {
                const orgUnit = orgUnitsByPath[addedPath];

                if (orgUnit && orgUnit.level < countryLevel) {
                    return [orgUnit, ...orgUnit.children].map(ou => ou.path);
                } else {
                    return [addedPath];
                }
            });

            const pathsToRemove = _.flatMap(removedPaths, pathToRemove => {
                return prevSelectedPaths.filter(path => path.startsWith(pathToRemove));
            });

            const newSelectedPathsWithChildren = _(prevSelectedPaths)
                .union(pathsToAdd)
                .difference(pathsToRemove)
                .uniq()
                .value();

            onChange(prev => ({ ...prev, orgUnitPaths: newSelectedPathsWithChildren }));
        },
        [onChange, orgUnitPaths, orgUnitsByPath]
    );

    const setDataSetIds = React.useCallback<DropdownHandler>(
        dataSetIds => onChange(prev => ({ ...prev, dataSetIds })),
        [onChange]
    );

    const setApprovalStatus = React.useCallback<SingleDropdownHandler>(
        approvalStatus => {
            onChange(filter => ({ ...filter, approvalStatus: toBool(approvalStatus) }));
        },
        [onChange]
    );

    return (
        <Container>
            <OrgUnitsFilterButton
                api={api}
                rootIds={rootIds}
                selected={filter.orgUnitPaths}
                setSelected={setOrgUnitPaths}
                selectableLevels={[1, 2, 3]}
                selectableIds={selectableIds}
            />
            
            <SingleDropdownStyled
                items={approvalStatusItems}
                value={fromBool(filter.approvalStatus)}
                onChange={setApprovalStatus}
                label={i18n.t("Submission status")}
            />

            <DropdownStyled
                items={dataSetItems}
                values={filter.dataSetIds}
                onChange={setDataSetIds}
                label={i18n.t("Data sets")}
            />
        </Container>
    );
});

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

function toBool(s: string | undefined): boolean | undefined {
    return s === undefined ? undefined : s === "true";
}

function fromBool(value: boolean | undefined): string | undefined {
    return value === undefined ? undefined : value.toString();
}

type DropdownHandler = MultipleDropdownProps["onChange"];
type SingleDropdownHandler = DropdownProps["onChange"];

const countryLevel = 3;
