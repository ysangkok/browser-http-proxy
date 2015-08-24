package main
import (
 "io"
 "bufio"
 "net"
 "log"
 "github.com/jacobsa/go-serial/serial"
 "encoding/json"
 "encoding/base64"
 "os"
)

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

ln, err := net.Listen("tcp", ":8083")
if err != nil {
	log.Fatalf("net.Listen: %v", err);
}

serialReader := bufio.NewReader(port)

for {
	conn, err := ln.Accept()
	if err != nil {
		log.Fatalf("net.Listen: %v", err);
	}
        handleSingle(conn, serialReader, port)
}

}

func handleSingle(conn net.Conn, serialReader *bufio.Reader, port io.ReadWriteCloser) {
	b := bufio.NewReader(conn)
	cs := make(chan struct{})
	go serialToTCP(conn, serialReader, cs)
	new := true
	for {
		line, err := b.ReadBytes('\n')
		if err != nil {
			log.Printf("ReadBytes failed: %v", err)
			conn.Close()
			return
		}
		m := ReqMesg{new, base64.StdEncoding.EncodeToString(line)}
		encoded, err := json.Marshal(m)
		if err != nil {
			log.Fatalf("json.Marshal: %v", err)
		}
		port.Write(encoded)
		port.Write([]byte{'\n'})
		new = false
	}
	<-cs;
}

func serialToTCP(conn net.Conn, serialReader *bufio.Reader, cs chan struct{}) {
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
			log.Printf("conn.Write failed, but wrote %v bytes: %v", written, err)
			break;
		}
		if (resp.Done) {
			conn.Close()
			log.Printf("Done bit set, reply completely sent...")
			cs <- struct{}{};
			break
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
