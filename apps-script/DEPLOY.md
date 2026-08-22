# Deploy the family votes API (one-time, as Jackie on bgtobk)

This cannot be finished from the box without a Google login in the Apps Script UI.

1. Open the sheet: https://docs.google.com/spreadsheets/d/1RTtasYfCW41xW15fD_oYpg0BEoE0D-kmInNVHorTLEU/edit
2. Extensions → Apps Script
3. Delete any starter `myFunction` and paste the contents of `Code.gs`
4. Save (name it Near Nancy's votes API)
5. Deploy → New deployment
6. Type: Web app
7. Description: family votes
8. Execute as: Me (bgtobk@gmail.com / Jacqueline Handy)
9. Who has access: Anyone
10. Deploy → Authorize access if asked → allow the sheet
11. Copy the Web app URL (`https://script.google.com/macros/s/.../exec`)
12. Put it in `votes-config.json` as `{ "endpoint": "THAT_URL" }` and push to `hellovictoriav/near-nancys` main

The listings page already calls `?op=list` and `?op=vote&name=&listing_id=&vote=&note=&address=`.
