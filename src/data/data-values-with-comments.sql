SELECT
    dataset.name AS datasetname,
    dataelement.uid AS dataelementid,
    dataelement.name AS dataelementname,
    categoryoptioncombo.name AS cocname,
    datavalue.value AS value,
    datavalue.comment AS comment,
    datavalue.lastupdated AS lastupdated,
    datavalue.storedby AS storedby,
    organisationunit.name AS orgunit,
    _periodstructure.iso AS period
FROM
    datavalue
    INNER JOIN dataelement USING (dataelementid)
    INNER JOIN categoryoptioncombo USING (categoryoptioncomboid)
    INNER JOIN organisationunit ON (organisationunit.organisationunitid = datavalue.sourceid)
    INNER JOIN _periodstructure USING (periodid)
    INNER JOIN datasetelement USING (dataelementid)
    INNER JOIN dataset USING (datasetid)
    INNER JOIN period USING (periodid)
WHERE
    dataset.uid ~ ('^' || replace('${dataSetIds}', '-', '|') || '$')
    AND organisationunit.path ~ (replace('${orgUnitIds}', '-', '|'))
    AND _periodstructure.iso ~ ('^' || replace('${periods}', '-', '|') || '$')
    AND datavalue.comment IS NOT NULL
ORDER BY
    ${orderByColumn} ${orderByDirection}
