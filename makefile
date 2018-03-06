sync-code:
	rsync -r --exclude node_modules/ --exclude .git/ \
		./ prubot:prubot/

build-image-depcache:
	docker build -t prubot-depcache -f Dockerfile.depcache .

build-image:
	docker build . -t prubot

restart-server:
	- docker stop prubot
	- docker rm prubot
	docker run -d --restart always --name prubot -p8080:3000 prubot

update-server:
	make sync-code
	ssh prubot 'cd prubot && make build-image && make restart-server'
