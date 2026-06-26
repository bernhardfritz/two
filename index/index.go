package main

import (
	_ "embed"
	"html/template"
	"log"
	"os"
	"path"
)

type PageData struct {
	DirPath string
	Entries []os.DirEntry
}

//go:embed index.html.template
var indexHtmlTemplate string

func main() {
	if len(os.Args) < 2 {
		log.Fatalf("usage: %s path", os.Args[0])
	}
	dirPath := path.Clean(os.Args[1])
	entries, err := os.ReadDir(dirPath)
	if err != nil {
		log.Fatal(err)
	}

	tmpl, err := template.New("index.html.template").Parse(indexHtmlTemplate)
	if err != nil {
		log.Fatal(err)
	}

	data := PageData{
		DirPath: dirPath,
		Entries: entries,
	}
	tmpl.Execute(os.Stdout, data)
}
