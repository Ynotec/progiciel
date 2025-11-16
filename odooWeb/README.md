# odooWeb
Interface : 
<img width="1026" height="1025" alt="image" src="https://github.com/user-attachments/assets/333f928a-1f7f-49e8-b3d6-627c2d792efc" />


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
      - ODOO_PROXY_MODE=true
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
    proxy_pass http://web:8069;
    proxy_redirect off;

    proxy_set_header Host                $host;
    proxy_set_header X-Forwarded-Host    $host;
    proxy_set_header X-Forwarded-Proto   $scheme;
    proxy_set_header X-Forwarded-Port    $server_port;
    proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
    proxy_set_header X-Real-IP           $remote_addr;

    add_header Access-Control-Allow-Origin      $http_origin always;
    add_header Access-Control-Allow-Credentials true         always;
    add_header Access-Control-Allow-Methods     "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers     "Content-Type, X-Requested-With, Authorization, Origin, Accept" always;
    add_header Vary Origin always;
}
}
```
