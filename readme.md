## To start:

```
docker compose down -v
```

Just to be sure that the data is gone (if running multiple times)

Then just:

```
docker compose up --build
```

The page should now be available at http://127.0.0.1/home

phpMyAdmin is available at http://127.0.0.1:8080/

There is a default user (non admin) for login on the page

```
test@user.com
password
```

Use that to test things out.
