# PostgreSQL Password Recovery Guide

## Option 1: Check pgAdmin Saved Password (Easiest)

If you've connected to PostgreSQL in pgAdmin before, the password might be saved:

1. Open **pgAdmin**
2. Right-click on your **livemo** database server
3. Click **Properties**
4. Go to the **Connection** tab
5. The password field might show dots - you can try connecting without changing it

## Option 2: Reset PostgreSQL Password

### Step 1: Find pg_hba.conf file
Location is usually:
- `C:\Program Files\PostgreSQL\15\data\pg_hba.conf`
- `C:\Program Files\PostgreSQL\14\data\pg_hba.conf`
- Or check your PostgreSQL installation directory

### Step 2: Edit pg_hba.conf
1. Open as Administrator
2. Find the line that looks like:
   ```
   host    all             all             127.0.0.1/32            scram-sha-256
   ```
3. Change `scram-sha-256` to `trust`:
   ```
   host    all             all             127.0.0.1/32            trust
   ```
4. Save the file

### Step 3: Restart PostgreSQL
Open Command Prompt as Administrator:
```cmd
net stop postgresql-x64-15
net start postgresql-x64-15
```
(Replace `15` with your PostgreSQL version)

### Step 4: Reset Password
Open Command Prompt:
```cmd
psql -U postgres
ALTER USER postgres PASSWORD 'new_password_here';
\q
```

### Step 5: Restore pg_hba.conf
1. Change `trust` back to `scram-sha-256`
2. Restart PostgreSQL again

## Option 3: Use Windows Authentication (If Available)

If PostgreSQL is configured for Windows authentication:

1. Update `.env` to:
   ```
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=livemo
   DB_USERNAME=your_windows_username
   DB_PASSWORD=
   ```

## Option 4: Create New PostgreSQL User

If you can access pgAdmin:

1. Open pgAdmin
2. Right-click **Login/Group Roles**
3. Create → Login/Group Role
4. Name: `livemo_user`
5. Password: `livemo123` (or your choice)
6. Privileges: Check "Can login?" and "Superuser"
7. Save

Then update `.env`:
```
DB_USERNAME=livemo_user
DB_PASSWORD=livemo123
```

## Quick Test

After setting password, test connection:
```cmd
psql -U postgres -d livemo -h 127.0.0.1
```

If successful, you'll see:
```
livemo=#
```

---

**Which option would you like to try?**
