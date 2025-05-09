export DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMGM2YzdmMDktNjBiMC00NDJjLWIzODQtZTI4YjUwNjc5ZWQ0IiwidGVuYW50X2lkIjoiMWFmYjNjNWM1OTgxOGVlYWViOGVhYzRhNjI0YTJmMDJlNDA1Y2NkNDRjNWYzNjZjNjc0YWJjMTFkZTE3ZWRhNyIsImludGVybmFsX3NlY3JldCI6IjRmYmYwOTMwLTIxYjctNDk1Yi1hMzQ2LTFiYjY1Mjc3ZDQ3YSJ9.BnRU0_sEjrqpjrboQIF764kPHf7PBwOYQSJsFQI1fC4"

# npx @prisma/ppg-tunnel --host 127.0.0.1  --port 5432 \

PGSSLMODE=disable \
pg_restore \
  -h 127.0.0.1 \
  -p 5432 \
  -v \
  -d postgres \
  ./mydatabase.bak \
&& echo "-complete-"
