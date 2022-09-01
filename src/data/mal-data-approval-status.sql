SELECT dataset.name                                      AS dataset,
       dataset.uid                                       AS datasetuid,
       organisationunit.uid                              AS orgunituid,
       organisationunit.name                             AS orgunit,
       _periodstructure.yearly                              AS period,
       categoryoptioncombo.name                          AS attribute,
       dataapprovalworkflow.uid                          AS approvalworkflowuid,
       dataapprovalworkflow.name                         AS approvalworkflow,
       entries.lastupdated                               AS lastupdatedvalue,
       completedatasetregistration.completed IS NOT NULL AS completed,
       dataapproval.accepted IS NOT NULL                 AS validated
FROM ((SELECT datavalue.periodid,
              datavalue.sourceid                         AS organisationunitid,
              datavalue.attributeoptioncomboid,
              dataset.datasetid,
              dataset.workflowid,
              MAX(datavalue.lastupdated)                 AS lastupdated
       FROM datavalue
                JOIN datasetelement USING (dataelementid)
                JOIN dataset USING (datasetid)
       /** TODO: Filter by DEs, remove totals **/
       WHERE dataset.uid ~ ('^' || replace('${dataSets}', '-', '|') || '$')
       /**  Filtered by orgunits in the dataset**/
     AND sourceid in ( select dss.sourceid from  datasetsource dss  where  dss.datasetid = dataset.datasetid) 
       GROUP BY datavalue.periodid, datavalue.sourceid, datavalue.attributeoptioncomboid, dataset.datasetid, dataset.workflowid) AS entries
         INNER JOIN _periodstructure USING (periodid)
         INNER JOIN organisationunit USING (organisationunitid)
         INNER JOIN _orgunitstructure USING (organisationunitid)
         INNER JOIN dataapprovalworkflow USING (workflowid)
         INNER JOIN dataapprovallevel ON (dataapprovallevel.orgunitlevel = _orgunitstructure.level)
         INNER JOIN dataset USING (datasetid)
         INNER JOIN categoryoptioncombo ON (categoryoptioncombo.categoryoptioncomboid = entries.attributeoptioncomboid)
         LEFT JOIN completedatasetregistration ON ((completedatasetregistration.datasetid = entries.datasetid) AND
                                                   (completedatasetregistration.periodid = entries.periodid) AND
                                                   (completedatasetregistration.sourceid = entries.organisationunitid) AND
                                                   (completedatasetregistration.attributeoptioncomboid =
                                                    entries.attributeoptioncomboid))
         LEFT JOIN dataapproval ON ((dataapproval.workflowid = dataset.workflowid) AND
                                    (dataapproval.organisationunitid = entries.organisationunitid) AND
                                    (dataapproval.periodid = entries.periodid) AND
                                    (dataapproval.attributeoptioncomboid = entries.attributeoptioncomboid) AND
                                    (dataapproval.dataapprovallevelid = dataapprovallevel.dataapprovallevelid)))
WHERE organisationunit.path ~ (replace('${orgUnitRoot}', '-', '|'))
  AND organisationunit.uid ~ ('^' || replace('${orgUnits}', '-', '|') || '$')
  AND _periodstructure.yearly ~ ('^' || replace('${periods}', '-', '|') || '$')
  AND (completedatasetregistration.completed IS NOT NULL)::text ~ ('^' || replace('${completed}', '-', '|') || '$')
  AND (dataapproval.accepted IS NOT NULL)::text ~ ('^' || replace('${approved}', '-', '|') || '$')
ORDER BY
    ${orderByColumn} ${orderByDirection},
    orgunit ASC,
    period DESC,
    dataset ASC,
    attribute ASC,
    completed ASC,
    validated ASC,
    lastupdatedvalue DESC;