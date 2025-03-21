package http

import (
	"fmt"
	"net/http"
)

func Serve(port int) error {
	r := router()
	err := http.ListenAndServeTLS(fmt.Sprintf(":%d", port), "cert/localhost+2.pem", "cert/localhost+2-key.pem", r)
	//err := http.ListenAndServe(fmt.Sprintf(":%d", port), r)
	return err
}
