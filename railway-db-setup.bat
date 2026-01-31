@echo off
echo.
echo ===== Railway Database Setup =====
echo.
echo After your Railway app is deployed:
echo 1. Go to Railway dashboard
echo 2. Copy the DATABASE_URL from Variables tab
echo 3. Run this command:
echo.
echo set DATABASE_URL=your-railway-database-url-here
echo npm run db:push
echo.
echo This will create all the tables in your Railway PostgreSQL database.
echo.
pause