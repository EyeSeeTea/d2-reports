SELECT dataset.name                                      AS dataset,
       organisationunit.name                             AS orgunit,
       _periodstructure.iso                              AS period,
       categoryoptioncombo.name                          AS attribute,
       entries.lastupdated                               AS lastupdatedvalue,
       completedatasetregistration.completed IS NOT NULL AS completed,
       dataapproval.accepted IS NOT NULL                 AS validated
FROM ((SELECT datavalue.periodid,
              datavalue.sourceid         AS organisationunitid,
              datavalue.attributeoptioncomboid,
              dataset.datasetid,
              MAX(datavalue.lastupdated) AS lastupdated,
              dataapprovalworkflow.workflowid
       FROM datavalue
                JOIN datasetelement USING (dataelementid)
                JOIN dataset USING (datasetid)
                CROSS JOIN dataapprovalworkflow
       WHERE dataset.uid ~ ('^' || replace('${dataSets}', '-', '|') || '$')
         AND dataapprovalworkflow.uid ~ ('^' || replace('${approvalWorkflows}', '-', '|') || '$')
       GROUP BY datavalue.periodid, datavalue.sourceid, datavalue.attributeoptioncomboid, dataset.datasetid,
                dataapprovalworkflow.workflowid) AS entries
         INNER JOIN _periodstructure USING (periodid)
         INNER JOIN organisationunit USING (organisationunitid)
         INNER JOIN _orgunitstructure USING (organisationunitid)
         INNER JOIN dataapprovallevel ON (dataapprovallevel.orgunitlevel = _orgunitstructure.level)
         INNER JOIN dataset USING (datasetid)
         INNER JOIN categoryoptioncombo ON (categoryoptioncombo.categoryoptioncomboid = entries.attributeoptioncomboid)
         LEFT JOIN completedatasetregistration ON ((completedatasetregistration.datasetid = entries.datasetid) AND
                                                   (completedatasetregistration.periodid = entries.periodid) AND
                                                   (completedatasetregistration.sourceid = entries.organisationunitid) AND
                                                   (completedatasetregistration.attributeoptioncomboid =
                                                    entries.attributeoptioncomboid))
         LEFT JOIN dataapproval ON ((dataapproval.workflowid = entries.workflowid) AND
                                    (dataapproval.organisationunitid = entries.organisationunitid) AND
                                    (dataapproval.periodid = entries.periodid) AND
                                    (dataapproval.attributeoptioncomboid = entries.attributeoptioncomboid) AND
                                    (dataapproval.dataapprovallevelid = dataapprovallevel.dataapprovallevelid)))
WHERE organisationunit.uid ~ ('^' || replace('${orgUnits}', '-', '|') || '$')
  AND _periodstructure.iso ~ ('^' || replace('${periods}', '-', '|') || '$')
ORDER BY ${orderByColumn} ${orderByDirection};