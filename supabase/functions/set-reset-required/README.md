# set-reset-required

HTTP edge function to update the `reset_required` flag in the `profiles` table.

The function expects a JSON body with:

```json
{ "email": "user@example.com", "value": true }
```

It uses the service role key to bypass RLS and update the matching profile row.
