import time
import zmq

ctx = zmq.Context()
socket = ctx.socket(zmq.REP)
socket.bind('tcp://*:5555')

while True:
	msg = socket.recv_unicode()
	time.sleep(1)
	socket.send_unicode("World")

socket.close()
ctx.term()
