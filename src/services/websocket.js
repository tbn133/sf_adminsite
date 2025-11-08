class WebSocketService {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10 // Tăng số lần retry
    this.listeners = new Map()
    this.isConnected = false
    this.manualDisconnect = false // Để phân biệt disconnect thủ công vs tự động
    this.pingInterval = null
    this.pingIntervalTime = 30000 // Gửi ping mỗi 30 giây
    this.pongTimeout = null
    this.pongTimeoutTime = 10000 // Chờ pong trong 10 giây
    this.reconnectTimeout = null
  }

  connect() {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/realtime'

    // Reset manual disconnect flag khi connect chủ động
    this.manualDisconnect = false

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.emit('connected')

        // Bắt đầu ping/pong mechanism
        this.startPingPong()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // Xử lý pong response
          if (data.type === 'pong') {
            this.handlePong()
            return
          }

          this.emit('message', data)

          // Emit specific event types
          if (data.type) {
            this.emit(data.type, data)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.emit('error', error)
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.isConnected = false
        this.stopPingPong()
        this.emit('disconnected')

        // Chỉ reconnect nếu không phải disconnect thủ công
        if (!this.manualDisconnect) {
          this.attemptReconnect()
        }
      }
    } catch (error) {
      console.error('Error connecting WebSocket:', error)
      // Thử reconnect khi có lỗi
      if (!this.manualDisconnect) {
        this.attemptReconnect()
      }
    }
  }

  attemptReconnect() {
    // Clear timeout cũ nếu có
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      this.emit('reconnecting', { attempt: this.reconnectAttempts, delay })

      this.reconnectTimeout = setTimeout(() => {
        console.log(`Attempting reconnect ${this.reconnectAttempts}...`)
        this.connect()
      }, delay)
    } else {
      console.error('Max reconnect attempts reached. Giving up.')
      this.emit('reconnect_failed')
    }
  }

  // Ping/Pong mechanism để duy trì kết nối
  startPingPong() {
    // Dọn dẹp interval cũ nếu có
    this.stopPingPong()

    console.log('Starting ping/pong mechanism')

    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Gửi ping
        this.ws.send(JSON.stringify({ type: 'ping' }))
        console.log('Sent ping')

        // Đặt timeout chờ pong
        this.pongTimeout = setTimeout(() => {
          console.warn('Pong timeout - connection may be dead, reconnecting...')
          // Không nhận được pong, coi như kết nối đã chết
          this.ws.close()
        }, this.pongTimeoutTime)
      }
    }, this.pingIntervalTime)
  }

  handlePong() {
    console.log('Received pong')
    // Clear timeout khi nhận được pong
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout)
      this.pongTimeout = null
    }
  }

  stopPingPong() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout)
      this.pongTimeout = null
    }
  }

  subscribe(deviceId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        device_id: deviceId
      }))
    }
  }

  unsubscribe(deviceId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        device_id: deviceId
      }))
    }
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data))
    }
  }

  disconnect() {
    // Đánh dấu là disconnect thủ công để tránh auto-reconnect
    this.manualDisconnect = true

    // Dọn dẹp ping/pong
    this.stopPingPong()

    // Dọn dẹp reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    // Đóng WebSocket connection
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.isConnected = false
    this.reconnectAttempts = 0
  }

  // Method để reset và reconnect (dùng khi muốn thử lại sau khi đã give up)
  reconnect() {
    this.reconnectAttempts = 0
    this.manualDisconnect = false
    this.connect()
  }

  // Clear tất cả listeners
  clearListeners() {
    this.listeners.clear()
  }
}

export default new WebSocketService()

