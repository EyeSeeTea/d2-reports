SELECT dv.value as fileResourceUId,de.uid as dataElementUId,p.startdate as period,coc.uid as categoryOptionComboUId, ou.uid as organisationUnitUId, aoc.uid as attributeoptioncombouid FROM datavalue dv
INNER JOIN dataelement de ON de.dataelementid=dv.dataelementid 
INNER JOIN period p ON p.periodid=dv.periodid 
INNER JOIN categoryoptioncombo coc ON coc.categoryoptioncomboid=dv.categoryoptioncomboid  
INNER JOIN categoryoptioncombo aoc ON aoc.categoryoptioncomboid=dv.attributeoptioncomboid 
INNER JOIN organisationunit ou ON dv.sourceid = ou.organisationunitid
WHERE value IN (SELECT uid FROM fileresource WHERE domain='DATA_VALUE')
  