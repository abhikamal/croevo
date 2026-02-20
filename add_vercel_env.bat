@echo off
echo Adding SUPABASE_KEY...
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicWhvZ2xrenRxZGNyd3hjcGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NTk1OTAsImV4cCI6MjA4NzEzNTU5MH0.x9k0_oqy2IZk7c0tcW_L_bRwENeYin6ltiq43WNtjFw| vercel env add SUPABASE_KEY production

echo Adding JWT_SECRET...
echo mySuperSecretKey123!RandomString2024| vercel env add JWT_SECRET production

echo Adding ADMIN_USER...
echo admin| vercel env add ADMIN_USER production

echo Adding ADMIN_PASS...
echo password123| vercel env add ADMIN_PASS production

echo Adding ALLOWED_ORIGINS...
echo *| vercel env add ALLOWED_ORIGINS production

echo Done.
