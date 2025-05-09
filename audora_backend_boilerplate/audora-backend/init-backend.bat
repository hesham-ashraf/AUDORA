@echo off
echo Creating .env file...
echo PORT=5000 > .env
echo DATABASE_URL="file:./dev.db" >> .env
echo JWT_SECRET="your-super-secret-jwt-secret-key" >> .env
echo NODE_ENV="development" >> .env
echo JWT_EXPIRY="7d" >> .env

echo Installing dependencies...
call npm install

echo Generating Prisma client...
call npx prisma generate

echo Pushing database schema changes...
call npx prisma db push

echo Seeding database...
call npm run seed

echo Starting backend server...
call npm run dev 