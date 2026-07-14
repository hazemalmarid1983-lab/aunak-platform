# Vercel env — central base cutover

Set these on **Preview + Production**, then **Redeploy**.

```
AIRTABLE_BASE_ID=appcjitgWsbvIebwf
VITE_AIRTABLE_BASE_ID=appcjitgWsbvIebwf
AIRTABLE_API_KEY=<same pat… that can open appcjitgWsbvIebwf>
VITE_USE_AIRTABLE_PROXY=true

VITE_AIRTABLE_CENTERS_TABLE_ID=tblm1ayaXTG0vdm7d
VITE_AIRTABLE_STUDENTS_TABLE_ID=tblTidBPaVM4cf3O9
VITE_AIRTABLE_SPECIALISTS_TABLE_ID=tblqTYEHCPBO23DBa
VITE_AIRTABLE_ACCESS_TABLE_ID=tblsGNIKRfTpMZ8Kn
VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID=tblnNGiaKccMSpizT
VITE_AIRTABLE_SESSION_PERIODS_TABLE_ID=tblkuCfFaopSsOKOG
VITE_AIRTABLE_ATTENDANCE_TABLE_ID=tbl1oGzt0E5jYNA5e
VITE_AIRTABLE_GOAL_EVIDENCE_TABLE_ID=tblnZC5LIbRWze6T9
VITE_AIRTABLE_ATTENDANCE_CORRECTIONS_TABLE_ID=tblpxTavOza4SAjlH
```

Also in Airtable token settings: grant this PAT access to base `appcjitgWsbvIebwf`.

After cutover: copy your specialist/admin `access_token` row into the new **Access Control** table (old base tokens will not work).
