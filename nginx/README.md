# How to build GitHub pages

From development container run:

```bash
for example in ./examples/*/; do npm --prefix "$example" run build -- --base /two/$(basename $example)/ --outDir ../../nginx/html/two/$(basename $example)/; done
```

From host run:

```bash
rm ./nginx/html/two/index.html
container_id=$(docker run -d --rm -v $PWD/nginx/html:/usr/share/nginx/html -v $PWD/nginx/nginx.conf:/etc/nginx/conf.d/default.conf -p 8080:80 nginx)
until curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/two/ | grep -q "200"; do sleep 1; done
index_html=$(curl -s http://localhost:8080/two/)
docker stop $container_id
echo $index_html > ./nginx/html/two/index.html
python3 -m http.server 8080 -d ./nginx/html
```