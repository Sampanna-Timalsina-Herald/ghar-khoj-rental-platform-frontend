import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const useSocket = () => {
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'
    const token = localStorage.getItem('token')

    const newSocket = io(socketUrl, {
      auth: {
        token,
      },
    })

    newSocket.on('connect', () => {
      console.log('Socket connected')
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  return socket
}

export default useSocket
