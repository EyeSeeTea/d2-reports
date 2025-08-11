SELECT 
  dv.value as fileResourceUId,
  de.uid as dataElementUId,
  coc.uid as categoryOptionComboUId, 
  ou.uid as organisationUnitUId, 
  aoc.uid as attributeoptioncombouid,
  pt.name as periodtypename,
  ps.daily,
  ps.weekly,
  ps.weeklywednesday,
  ps.weeklythursday,
  ps.weeklysaturday,
  ps.weeklysunday,
  ps.biweekly,
  ps.monthly,
  ps.bimonthly,
  ps.quarterly,
  ps.quarterlynov,
  ps.sixmonthly,
  ps.sixmonthlyapril,
  ps.sixmonthlynov,
  ps.yearly,
  ps.financialapril,
  ps.financialjuly,
  ps.financialoct,
  ps.financialnov
FROM datavalue dv
INNER JOIN dataelement de ON de.dataelementid=dv.dataelementid 
INNER JOIN period p ON p.periodid=dv.periodid 
INNER JOIN _periodstructure ps ON p.periodid=ps.periodid 
INNER JOIN periodtype pt ON pt.periodtypeid=p.periodtypeid
INNER JOIN categoryoptioncombo coc ON coc.categoryoptioncomboid=dv.categoryoptioncomboid  
INNER JOIN categoryoptioncombo aoc ON aoc.categoryoptioncomboid=dv.attributeoptioncomboid 
INNER JOIN organisationunit ou ON dv.sourceid = ou.organisationunitid
WHERE dv.value IN (SELECT uid FROM fileresource WHERE domain='DATA_VALUE')
  
  