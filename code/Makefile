port := 3000
auth := Basic dG9tYXM6c2VjcmV0

start:
	@docker-compose -f $(project)/docker-compose.yml up

stop:
	@docker-compose -f $(project)/docker-compose.yml down

create-user:
	@curl \
		--silent \
		-X POST \
		http://localhost:$(port)/signup \
		-H 'Content-Type: application/json' \
		-d '{"username":"$(username)","password":"$(password)"}' \
		| jq .

get-post:
	@curl \
		--silent \
		http://localhost:$(port)/post/$(id) \
		-H 'Authorization: $(auth)' \
		| jq .

search-post:
	@curl \
		--silent \
		http://localhost:$(port)/post?search=$(search) \
		-H 'Authorization: $(auth)' \
		| jq .

create-post:
	@curl \
		--silent \
		-X POST \
		http://localhost:$(port)/post/create \
		-H 'Content-Type: application/json' \
		-H 'Authorization: $(auth)' \
		-d '{"text":"$(text)"}' \
		| jq .

get-user-posts:
	@curl \
		--silent \
		http://localhost:$(port)/user/$(username)/post \
		-H 'Authorization: $(auth)' \
		| jq .
