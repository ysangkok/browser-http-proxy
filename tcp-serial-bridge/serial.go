package main
import (
 "bufio"
 "net"
 "log"
 "github.com/jacobsa/go-serial/serial"
 "encoding/json"
 "encoding/base64"
 "os"
)

//func handler(w http.ResponseWriter, req *http.Request) {
//	w.Header().Set("Content-Type", "text/plain")
//	w.Write([]byte("This is an example server.\n"))
//}

func main() {

// Set up options.
options := serial.OpenOptions{
  PortName: os.Args[1],
  BaudRate: 19200,
  DataBits: 8,
  StopBits: 1,
  MinimumReadSize: 1,
}

// Open the port.
port, err := serial.Open(options)
if err != nil {
  log.Fatalf("serial.Open: %v", err)
}

// Make sure to close it later.
defer port.Close()

// s, err := json.Marshal("GET /loldongs1 HTTP/1.0\r\n\r\n")
//
// // Write 4 bytes to the port.
// b := append([]byte(s), 0x0a)
// n, err := port.Write(b)
// if err != nil {
//   log.Fatalf("port.Write: %v", err)
// }
//
// log.Println("Wrote", n, "bytes.")


//log.Fatal(http.ListenAndServe(":8080", http.HandlerFunc(handler)))

ln, err := net.Listen("tcp", ":8080")
if err != nil {
	log.Fatalf("net.Listen: %v", err);
}

serialReader := bufio.NewReader(port)

outer: for {
	conn, err := ln.Accept()
	if err != nil {
		log.Fatalf("net.Listen: %v", err);
	}
	b := bufio.NewReader(conn)
	go serialToTCP(conn, serialReader)
	new := true
	for {
		line, err := b.ReadBytes('\n')
		if err != nil {
			log.Printf("ReadBytes failed! %v", err)
			conn.Close()
			continue outer
		}
		// bytes.Equal(line, []byte("\r\n")) // http line empty
		// req done
		m := ReqMesg{new, base64.StdEncoding.EncodeToString(line)}
		encoded, err := json.Marshal(m)
		if err != nil {
			log.Fatalf("json.Marshal: %v", err)
		}
		port.Write(encoded)
		port.Write([]byte{'\n'})
		new = false
	}
}

}

func serialToTCP(conn net.Conn, serialReader *bufio.Reader) {
	for {
		var resp RespMesg;
		str, err := serialReader.ReadBytes('\n')
		if err != nil {
			log.Fatalf("ReadBytes: %v", err)
		}
		err = json.Unmarshal(str, &resp);
		if err != nil {
			log.Fatalf("json.Unmarshal: %v", err)
		}
		written, err := conn.Write([]byte(resp.Data))
		if err != nil {
			log.Printf("conn.Write failed, only wrote %v! %v", written, err)
			// TODO read until Done
		}
		if (resp.Done) {
			conn.Close()
			log.Printf("reply completely sent...")
		}
	}
}

type RespMesg struct {
    Done bool
    Data string
}

type ReqMesg struct {
    New bool
    Data string
}
