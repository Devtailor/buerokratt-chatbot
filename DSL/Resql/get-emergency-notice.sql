SELECT id, key, value
FROM configuration
WHERE key IN (
   'emergencyNoticeText',
   'emergencyNoticeStartISO',
   'emergencyNoticeEndISO',
   'isEmergencyNoticeVisible')
  AND id IN (SELECT max(id) from configuration GROUP BY key)
  AND NOT deleted;
