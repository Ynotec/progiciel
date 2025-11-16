# odooWeb

Docker-compose : 
```
services:
  web:
    image: odoo:18.0
    depends_on:
      - mydb
    volumes:
      - ./addons:/mnt/extra-addons
    environment:
      - HOST=mydb
      - USER=odoo
      - PASSWORD=myodoo
    expose:
      - "8069"
  mydb:
    image: postgres:15
    environment:
      - POSTGRES_DB=postgres
      - POSTGRES_PASSWORD=myodoo
      - POSTGRES_USER=odoo
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - odoo-db-data:/var/lib/postgresql/data/pgdata
  proxy:
    image: nginx:1.27-alpine
    container_name: odoo18-proxy
    depends_on:
      - web
    restart: unless-stopped
    volumes:
      - ./proxy/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "80:80"         
volumes:
  odoo-db-data:
```

  We use "Proxy" for request CORS, nginx.conf : 

```
  server {
    listen 80;
    server_name _;

    location / {
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin $http_origin;
            add_header Access-Control-Allow-Credentials true;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, X-Requested-With, Authorization, Origin, Accept";
            add_header Access-Control-Max-Age 86400;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }

        proxy_pass http://web:8069;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, X-Requested-With, Authorization, Origin, Accept" always;
        add_header Vary Origin always;
    }
}

```
