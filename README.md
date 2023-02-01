## Atomic Tessellator - socketserver
### Websocket server for message passing between the reality API and InsilicoLab

---

Although this server is used for InsilicoLab, it is possible to use it as a generic websocket message pump.

---

### Building
```
docker build -t "atomict:socketserver" .
```

### Running
```
docker run -d -p 5000:5000 --name "atomict_socketserver" atomict:socketserver
```

---

Terminology:
  - Exchange, a collection of channels
  - Channel, a room where messages are broadcast
  - Message, a JSON message, to be broadcast to a channel
