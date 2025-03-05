package main

import "github.com/jcocozza/poopmap-web/http"

func main() {
	port := 54323
	err := http.Serve(port)
	if err != nil {
		panic(err)
	}
}

