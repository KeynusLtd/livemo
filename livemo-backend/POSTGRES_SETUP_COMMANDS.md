# PostgreSQL Setup via SQL Shell (psql)

## Step-by-Step Commands

### 1. When SQL Shell Prompts You:

```
Server [localhost]:
```
**Press ENTER** (accept default localhost)

```
Database [postgres]:
```
**Press ENTER** (accept default postgres)

```
Port [5432]:
```
**Press ENTER** (accept default 5432)

```
Username [postgres]:
```
**Press ENTER** (accept default postgres)

```
Password for user postgres:
```
**Type your postgres password** (or just press ENTER if no password)

---

### 2. Once Connected (you'll see `postgres=#`):

#### Create a new user for Livemo:
```sql
CREATE USER livemo_user WITH PASSWORD 'livemo123';
```

#### Grant superuser privileges:
```sql
ALTER USER livemo_user WITH SUPERUSER;
```

#### Grant all privileges on the livemo database:
```sql
GRANT ALL PRIVILEGES ON DATABASE livemo TO livemo_user;
```

#### Verify the user was created:
```sql
\du
```
You should see `livemo_user` in the list.

#### Exit psql:
```sql
\q
```

---

### 3. Test the New Connection:

Open a new SQL Shell and use:
- Server: `localhost`
- Database: `livemo`
- Port: `5432`
- Username: `livemo_user`
- Password: `livemo123`

If it connects successfully, you're ready!

---

## Update Your .env File

After successful connection, update these lines in `.env`:

```env
DB_USERNAME=livemo_user
DB_PASSWORD=livemo123
```

---

## Quick Reference

**List all databases:**
```sql
\l
```

**Connect to livemo database:**
```sql
\c livemo
```

**List all tables:**
```sql
\dt
```

**Exit psql:**
```sql
\q
```
