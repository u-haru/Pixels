#
# テスト環境、ffffffみたいな入力で色を変える
#

from socket import socket, SOL_SOCKET, SO_BROADCAST, AF_INET, SOCK_DGRAM

M_SIZE = 1024

serv_address = ('192.168.1.255', 1234)

sock = socket(AF_INET, SOCK_DGRAM)
sock.setsockopt(SOL_SOCKET, SO_BROADCAST, 1)

while True:
    try:
        print('Input any messages, Type [end] to exit')
        message = input()# ffffff みたいなメッセージ
        if message != 'end':
            rgb = int("0x"+message,16)
            data = bytes([rgb>>16&0xFF,rgb>>8&0xFF,rgb&0xFF])
            send_len = sock.sendto(data, serv_address)
            
        else:
            print('closing socket')
            sock.close()
            print('done')
            break

    except KeyboardInterrupt:
        print('closing socket')
        sock.close()
        print('done')
        break