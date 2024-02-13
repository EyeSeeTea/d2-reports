import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GLASSModule, Module } from "../../../../../domain/reports/glass-admin/entities/GLASSDataMaintenanceItem";
import styled from "styled-components";
import { Dropdown, DropdownProps } from "@eyeseetea/d2-ui-components";
import i18n from "../../../../../locales";
import { NamedRef } from "../../../../../domain/common/entities/Base";
import { useAppContext } from "../../../../contexts/app-context";

export interface FiltersProps {
    values: Filter;
    onChange: React.Dispatch<React.SetStateAction<Filter>>;
}

export interface Filter {
    module: Module | undefined;
}

export const Filters: React.FC<FiltersProps> = React.memo(props => {
    const { compositionRoot, config } = useAppContext();
    const { values: filter, onChange } = props;

    const [userModules, setUserModules] = useState<GLASSModule[]>([]);
    const filterOptions = useMemo(() => getFilterOptions(userModules), [userModules]);

    useEffect(() => {
        compositionRoot.glassAdmin.getModules(config).then(modules => setUserModules(modules));
    }, [compositionRoot.glassAdmin, config]);

    const moduleItems = useMemoOptionsFromNamedRef(filterOptions.modules);
    const setModule = useCallback<SingleDropdownHandler>(
        module => {
            onChange(filter => ({ ...filter, module: module as Module }));
        },
        [onChange]
    );

    return (
        <Container>
            <SingleDropdownStyled
                items={moduleItems}
                value={filter.module}
                onChange={setModule}
                label={i18n.t("Module")}
            />
        </Container>
    );
});

function getFilterOptions(userModules: NamedRef[]) {
    return {
        modules: userModules,
    };
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

const SingleDropdownStyled = styled(Dropdown)`
    margin-left: -10px;
    width: 250px;
`;

type SingleDropdownHandler = DropdownProps["onChange"];
