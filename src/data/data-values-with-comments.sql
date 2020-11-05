SELECT
    -- Returns UNION of two sets:
    --   - Data values with comments.
    --   - Data values with related comment stored in another data value. Pairing criteria:
    --     `NHWA_Comment of Abc` -> `NHWA_Abc`.
    --
    -- Notes:
    --   - Data elements without group assigned are not rendered.
    --   - Data elements in multiple data element groups render a separate row.
    --   - To define order:
    --     - dataelement.description = "order: N"
    --     - dataelementgroup.attributeValues.sectionOrder
    --     - category option combo by name.
    --
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
    created,
    storedby,
    orgunit,
    period,
    COALESCE((
        SELECT
            (regexp_matches(dataelementdescription, 'order:\s*(\d+)'))[1]), '999')::int AS dataelementorder,
    COALESCE(degav -> '${sectionOrderAttributeId}' ->> 'value', '999')::int AS degorder
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
        dataelementgroup.attributevalues AS degav,
        datavalue.created AS created
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
        dataelementgroup.attributevalues AS degav,
        datavalue.created AS created
    FROM
        datavalue AS datavalue
        INNER JOIN _periodstructure USING (periodid)
        INNER JOIN dataelement AS dataelement USING (dataelementid)
        INNER JOIN datavalue AS datavalueC ON datavalue.periodid = datavalueC.periodid
            AND datavalue.sourceid = datavalueC.sourceid
            AND datavalue.attributeoptioncomboid = datavalueC.attributeoptioncomboid
            AND NOT datavalue.deleted
            AND NOT datavalueC.deleted
            AND dataelement.uid = ANY (string_to_array(regexp_replace('${commentPairs}', '_\w+', '', 'g'), '-'))
            AND (datavalueC.dataelementid IN (
                    SELECT
                        dataelementid
                    FROM
                        dataelement
                WHERE
                    uid = ANY (string_to_array(regexp_replace('${commentPairs}', '\w+_', '', 'g'), '-'))))
                INNER JOIN dataelement AS dataelementC ON (datavalueC.dataelementid = dataelementC.dataelementid
                        AND (dataelement.uid || '_' || dataelementC.uid = ANY (string_to_array('${commentPairs}', '-'))))
                    INNER JOIN dataelementgroupmembers ON (dataelement.dataelementid = dataelementgroupmembers.dataelementid)
                    INNER JOIN dataelementgroup USING (dataelementgroupid)
                    INNER JOIN categoryoptioncombo ON (datavalue.categoryoptioncomboid = categoryoptioncombo.categoryoptioncomboid)
                    INNER JOIN organisationunit ON (organisationunit.organisationunitid = datavalue.sourceid)
                    INNER JOIN datasetelement ON (datavalue.dataelementid = datasetelement.dataelementid)
                    INNER JOIN dataset USING (datasetid)
                WHERE
                    _periodstructure.iso ~ ('^' || replace('${periods}', '-', '|') || '$')
                    AND organisationunit.path ~ (replace('${orgUnitIds}', '-', '|'))) AS unionttable
        WHERE ('${dataElementGroupIds}' = '-'
            OR degid = ANY (string_to_array('${dataElementGroupIds}', '-')))
ORDER BY
    __orderBy,
    datasetname ASC,
    period ASC,
    orgunit ASC,
    degorder ASC,
    dataelementorder ASC,
    dataelementname ASC,
    cocname ASC,
    storedby ASC;

