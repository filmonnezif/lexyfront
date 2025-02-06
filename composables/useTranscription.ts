import { ref, onUnmounted } from 'vue'

export function useTranscription() {
  const transcription = ref<string>('')
  const interimTranscription = ref<string>('')
  let socket: WebSocket | null = null

  const connect = (wsUrl: string) => {
    socket = new WebSocket(wsUrl)

    socket.onopen = () => {
      console.log('Azure Transcription socket connected')
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('Received transcription data:', data)
        
        if (data.type === 'interim') {
          // Update interim results for real-time feedback
          console.log('Interim transcription:', data.transcription)
          interimTranscription.value = data.transcription
        } else if (data.type === 'final') {
          // Update final transcription
          console.log('Final transcription:', data.transcription)
          transcription.value = data.transcription
          interimTranscription.value = ''
        }
        
        console.log(`Received ${data.type} transcription:`, data.transcription)
      } catch (err) {
        console.error('Error parsing transcription message:', err)
      }
    }

    socket.onerror = (err) => {
      console.error('Azure Transcription socket error:', err)
    }

    socket.onclose = () => {
      console.log('Azure Transcription socket closed')
    }
  }

  const sendAudioChunk = (chunk: ArrayBuffer) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(new Uint8Array(chunk))
    }
  }

  const disconnect = () => {
    if (socket) {
      socket.close()
      socket = null
    }
  }
  const handleMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data)
    console.log('Received WebSocket message:', data)
    
    if (data.type === 'interim') {
      interimTranscription.value = data.transcription
    } else if (data.type === 'final') {
      transcription.value = data.transcription
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    transcription,
    interimTranscription,
    connect,
    sendAudioChunk,
    disconnect
  }
}
