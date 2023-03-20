import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
    OrgUnitsFilterButton,
    OrgUnitsFilterButtonProps,
} from "../../../components/org-units-filter/OrgUnitsFilterButton";
import { Id } from "../../../../domain/common/entities/Base";
import { useAppContext } from "../../../contexts/app-context";
import _ from "lodash";
import { getRootIds } from "../../../../domain/common/entities/OrgUnit";
import { D2Api } from "../../../../types/d2-api";
import i18n from "../../../../locales";
import MultipleDropdown from "../../../components/dropdown/MultipleDropdown";
import { Dropdown, DropdownProps, MultipleDropdownProps } from "@eyeseetea/d2-ui-components";

export interface DataSetsFiltersProps {
    values: Filter;
    options: FilterOptions;
    onChange: React.Dispatch<React.SetStateAction<Filter>>;
}

export interface Filter {
    orgUnitPaths: Id[];
    periods: string[];
    completionStatus?: boolean;
}

interface FilterOptions {
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
        children: {
            level: number;
            path: string;
        }[];
    }[];
}

export const Filters: React.FC<DataSetsFiltersProps> = React.memo(props => {
    const { config, api } = useAppContext();
    const { values: filter, options: filterOptions, onChange } = props;

    const periodItems = useMemoOptionsFromStrings(filterOptions.periods);

    const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
    const rootIds = React.useMemo(() => getRootIds(config.currentUser.orgUnits), [config]);

    const completionStatusItems = React.useMemo(() => {
        return [
            { value: "true", text: i18n.t("Completed") },
            { value: "false", text: i18n.t("Not completed") },
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
                            children: {
                                level: true,
                                path: true,
                                children: {
                                    level: true,
                                    path: true,
                                },
                            },
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
                    return [orgUnit, ...orgUnit.children, ...orgUnit.children.flatMap(child => child.children)].map(
                        ou => ou.path
                    );
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

    const setPeriods = React.useCallback<DropdownHandler>(
        periods => onChange(prev => ({ ...prev, periods })),
        [onChange]
    );

    const setCompletionStatus = React.useCallback<SingleDropdownHandler>(
        completionStatus => {
            onChange(filter => ({ ...filter, completionStatus: completionStatus === "true" }));
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
            />

            <DropdownStyled
                items={periodItems}
                values={filter.periods}
                onChange={setPeriods}
                label={i18n.t("Periods")}
            />

            <SingleDropdownStyled
                items={completionStatusItems}
                value={fromBool(filter.completionStatus)}
                onChange={setCompletionStatus}
                label={i18n.t("Questionnaire completed")}
            />
        </Container>
    );
});

function useMemoOptionsFromStrings(options: string[]) {
    return useMemo(() => {
        return options.map(option => ({ value: option, text: option }));
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
    width: 250px;
`;

function fromBool(value: boolean | undefined): string | undefined {
    return value === undefined ? undefined : value.toString();
}

type DropdownHandler = MultipleDropdownProps["onChange"];
type SingleDropdownHandler = DropdownProps["onChange"];

const countryLevel = 3;
