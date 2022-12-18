import eventlet
import socketio

sio = socketio.Server(cors_allowed_origins=['http://starlifter:3000'])

app = socketio.WSGIApp(sio, static_files={
    '/': {'content_type': 'text/html', 'filename': 'index.html'}
})


@sio.event
def connect(sid, environ):
    print('connect ', sid)


@sio.event
def join_channel(sid, data):
    print('join_channel ', data)
    sio.enter_room(sid, data['channel'])


@sio.event
def leave_channel(sid, data):
    print('leave_channel ', data)
    sio.leave_room(sid, data['channel'])


@sio.event
def my_message(sid, data):
    print('message ', data)


@sio.event
def disconnect(sid):
    print('disconnect ', sid)


if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 5000)), app)
