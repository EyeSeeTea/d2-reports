SELECT
    -- TODO: remove repeated?
    organisationunitpath,
    datasetname,
    dataelementid,
    dataelementname,
    dataelementdescription,
    degname,
    cocname,
    value,
    comment,
    lastupdated,
    storedby,
    orgunit,
    period,
    COALESCE((
        SELECT
            (regexp_matches(dataelementdescription, 'order:\s*(\d+)'))[1]), '0')::int AS dataelementorder,
    (degav -> '${sectionOrderAttributeId}' ->> 'value')::int AS degorder
FROM (
    SELECT
        organisationunit.path AS organisationunitpath,
        dataset.name AS datasetname,
        dataelement.uid AS dataelementid,
        dataelement.name AS dataelementname,
        dataelement.description AS dataelementdescription,
        dataelementgroup.uid AS degid,
        dataelementgroup.name AS degname,
        categoryoptioncombo.name AS cocname,
        datavalue.value AS value,
        datavalue.comment AS comment,
        datavalue.lastupdated AS lastupdated,
        datavalue.storedby AS storedby,
        organisationunit.name AS orgunit,
        _periodstructure.iso AS period,
        dataelementgroup.attributevalues AS degav
    FROM
        datavalue
        INNER JOIN dataelement USING (dataelementid)
        INNER JOIN dataelementgroupmembers USING (dataelementid)
        INNER JOIN dataelementgroup USING (dataelementgroupid)
        INNER JOIN categoryoptioncombo USING (categoryoptioncomboid)
        INNER JOIN organisationunit ON (organisationunit.organisationunitid = datavalue.sourceid)
        INNER JOIN _periodstructure USING (periodid)
        INNER JOIN datasetelement USING (dataelementid)
        INNER JOIN dataset USING (datasetid)
    WHERE
        dataset.uid ~ ('^' || replace('${dataSetIds}', '-', '|') || '$')
        AND organisationunit.path ~ (replace('${orgUnitIds}', '-', '|'))
        AND _periodstructure.iso ~ ('^' || replace('${periods}', '-', '|') || '$')
        AND datavalue.COMMENT IS NOT NULL
        AND datavalue.value != datavalue.comment
    UNION
    SELECT
        organisationunit.path AS organisationunitpath,
        dataset.name AS datasetname,
        dataelement.uid AS dataelementid,
        dataelement.name AS dataelementname,
        dataelement.description AS dataelementdescription,
        dataelementgroup.uid AS degid,
        dataelementgroup.name AS degname,
        categoryoptioncombo.name AS cocname,
        datavalue.value AS value,
        datavalueC.value AS comment,
        datavalue.lastupdated AS lastupdated,
        datavalue.storedby AS storedby,
        organisationunit.name AS orgunit,
        _periodstructure.iso AS period,
        dataelementgroup.attributevalues AS degav
    FROM
        datavalue AS datavalue
        INNER JOIN datavalue AS datavalueC ON (datavalue.periodid = datavalueC.periodid
                AND datavalue.sourceid = datavalueC.sourceid
                AND datavalue.attributeoptioncomboid = datavalueC.attributeoptioncomboid
                AND NOT datavalue.deleted
                AND NOT datavalueC.deleted
                AND datavalue.periodid IN (
                    SELECT
                        periodid
                    FROM
                        _periodstructure
                WHERE
                    iso = ANY (string_to_array('${periods}', '-')))
                AND (datavalue.dataelementid IN (
                        SELECT
                            dataelementid
                        FROM
                            dataelement
                        WHERE
                            uid = ANY (string_to_array(regexp_replace('${commentPairs}', '_\w+', '', 'g'), '-'))))
                    AND (datavalueC.dataelementid IN (
                            SELECT
                                dataelementid
                            FROM
                                dataelement
                            WHERE
                                uid = ANY (string_to_array(regexp_replace('${commentPairs}', '\w+_', '', 'g'), '-')))))
                        INNER JOIN dataelement AS dataelement ON (datavalue.dataelementid = dataelement.dataelementid)
                        INNER JOIN dataelement AS dataelementC ON (datavalueC.dataelementid = dataelementC.dataelementid
                                AND (dataelement.uid || '_' || dataelementC.uid = ANY (string_to_array('${commentPairs}', '-'))))
                            INNER JOIN dataelementgroupmembers ON (dataelement.dataelementid = dataelementgroupmembers.dataelementid)
                            INNER JOIN dataelementgroup USING (dataelementgroupid)
                            INNER JOIN categoryoptioncombo ON (datavalue.categoryoptioncomboid = categoryoptioncombo.categoryoptioncomboid)
                            INNER JOIN organisationunit ON (organisationunit.organisationunitid = datavalue.sourceid)
                            INNER JOIN _periodstructure ON (datavalue.periodid = _periodstructure.periodid)
                            INNER JOIN datasetelement ON (datavalue.dataelementid = datasetelement.dataelementid)
                            INNER JOIN dataset USING (datasetid)
                        WHERE
                            organisationunit.path ~ (replace('${orgUnitIds}', '-', '|'))) AS unionttable
                WHERE
                    '${dataElementGroupIds}' = '-'
                    OR degid = ANY (string_to_array('${dataElementGroupIds}', '-'))
            ORDER BY
                $ {orderByColumn} $ {orderByDirection},
                datasetname ASC,
                period ASC,
                orgunit ASC,
                dataelementorder ASC,
                degorder ASC,
                dataelementname ASC,
                storedby ASC;

