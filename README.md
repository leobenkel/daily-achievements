# daily-achievements

[![Netlify Status](https://api.netlify.com/api/v1/badges/a5539525-5cdd-4bb6-990f-1b1e0ef8ad0a/deploy-status)](https://app.netlify.com/sites/daily-achievements/deploys)

[Open](https://daily-achievements.netlify.app/)

# Dev

To run : 

```
bundle exec jekyll serve --livereload
```

and run

```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
    --new-window "http://127.0.0.1:4000" \
    --remote-debugging-port=9222 \
    --user-data-dir=/tmp/chrome2/ \
    --media-cache-size=1 \
    --disk-cache-size=1
```


# Useful links

* https://dev.to/prisma/how-to-setup-a-free-postgresql-database-on-heroku-1dc1

# Database

## Users
* user_id (PK)
* name (require)
* google_oauth (to set up google reminder)(opt)

## Notes
* note_id (PK)
* author_id (indexed)(required)
* date (indexed)(required)
* item_ids (required, need at east one to save)

## Items
* item_id (PK)
* note_id (required)
* tag_id (required)
* content (can be empty and will display: Worked on [TAG]

## Tags
* tag_id (PK)
* name (require)
* color_hex (default random) (require)


