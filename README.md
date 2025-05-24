# Poop Map Web

This is the web app for poop map.

Everything here runs on the client. Requests are made to our backend server.

## Production

The github action will deploy and serve everything in the `fs/` directory.

## Development

Just a http file server that serves html and javascript.

Simply do a `go run .` in the root of the project.
That will start serving the files on `http://localhost:54323`

The config is set so that in `dev` mode, the code will try to ping `http://localhost:54322` as the backend.

Now, whenever you make code changes (and written the file), all you need to do is run a hard refresh in the browser (e.g. ctrl+shift+r) and the new code will be there an running.
There is no need to resart the server or anything like that.
