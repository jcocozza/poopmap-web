package http

import "net/http"

func router() http.Handler {
	mux := http.NewServeMux()

	fs := http.FileServer(http.Dir("fs"))
	mux.Handle("/", fs)
	return mux
}
