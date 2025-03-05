package http

import (
	"fmt"
	"net/http"
)

func Serve(port int) error {
	r := router()
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), r)
	return err
}
