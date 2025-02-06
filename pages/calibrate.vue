<template>
  <div class="min-h-screen bg-purple-50 dark:bg-gray-900 p-8 relative gap-4">
    <Dialog :open="showDialog">
      <DialogContent class="bg-purple-50 max-w-3xl mx-auto p-2 sm:px-6 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-2xl shadow-xl border border-purple-100 dark:border-gray-800 ">

<!-- Initial Welcome Content -->
        <div v-if="showUserInfoDialog" class="max-w-2xl mx-auto space-y-4 p-3 sm:p-6">
  <DialogHeader class="space-y-2">
    <DialogDescription class="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
      Let's personalize your experience
    </DialogDescription>
  </DialogHeader>

  <div class="grid gap-4 py-2">
    <div class="space-y-1">
      <label class="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Your Name</label>
      <input 
        v-model="userInfo.username" 
        type="text"
        placeholder="Enter your name"
        class="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-gray-200 
              dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 
              focus:ring-purple-500 transition-all duration-200 outline-none
              text-sm sm:text-base"
      />
    </div>
  </div>
  <div class="max-w-2xl mx-auto">
    <DialogHeader class="space-y-2">
      <DialogDescription class="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
        Take a brief 3-paragraph reading test to help us optimize your experience.
      </DialogDescription>
    </DialogHeader>
  </div>

          <DialogFooter class="flex justify-end pt-4">
            <Button 
              class="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 
                    text-white font-medium rounded-lg shadow-lg hover:shadow-xl 
                    transition-all duration-200"
              @click="submitUserInfo"
              :disabled="!isFormComplete"
            >
              Get Started
            </Button>
          </DialogFooter>
        </div>


        <!-- Calibration Content -->
        <div v-else class="max-w-3xl mx-auto p-3">
          <DialogHeader>
            <DialogTitle class="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-700 text-center dark:text-gray-300">
              Paragraph {{ currentParagraph }}/3
            </DialogTitle>
          </DialogHeader>

          <!-- Countdown Overlay -->
          <div v-if="showCountdown" class="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span class="text-4xl sm:text-6xl text-white font-bold">{{ countdown }}</span>
          </div>

          <!-- Sample Text Card -->
          <Card class="mb-4 sm:mb-6 w-full bg-transparent dark:bg-gray-800 shadow-md">
            <CardHeader>
              <CardTitle class="text-xs sm:text-sm text-purple-600">Press play and read the following text</CardTitle>
            </CardHeader>
            <CardContent class="py-2 sm:py-4">
              <p class="text-base sm:text-lg flex flex-wrap">
                <span 
                  v-for="(word, index) in paragraphs[currentParagraph - 1].split(' ')" 
                  :key="index"
                  :class="[
                    'mr-1 sm:mr-2 mb-1 transition-all duration-300 ease-in-out',
                    isWordRead(word, index)
                      ? 'text-purple-600 dark:text-purple-800 transform scale-105' 
                      : 'text-gray-800 dark:text-gray-300'
                  ]"
                >
                  {{ word }}
                </span>
              </p>
            </CardContent>
          </Card>

          <div class="flex items-center justify-center gap-2 sm:gap-4">
            <!-- Play/Pause Button -->
            <Button
              v-if="!isParaComplete"
              @click="handlePlayPause"
              size="icon"
              class="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg transition-all bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
              variant="default"
            >
              <PlayIcon v-if="!isRecording || isPaused" class="h-4 w-4 sm:h-5 sm:w-5" />
              <PauseIcon v-else class="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            <!-- Recording Status -->
            <div
              v-if="isRecording && !isParaComplete"
              class="flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-sm"
            >
              <MicrophoneIcon class="h-3 w-3 sm:h-4 sm:w-4 text-red-500 animate-pulse" />
              <span class="text-xs sm:text-sm font-medium">{{ recordingSeconds }}s</span>
            </div>

            <!-- Control Buttons -->
            <div class="flex gap-2 sm:gap-4">
              <Button
                v-if="isPaused"
                @click="handleDone"
                variant="success"
                class="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
              >
                <CheckIcon class="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <Button
                v-if="isPaused || isParaComplete"
                @click="retryParagraph"
                variant="secondary"
                class="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
              >
                <ReloadIcon class="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <Button
                v-if="isParaComplete"
                @click="handleNext"
                :disabled="!isParaComplete"
                class="h-10 sm:h-12 px-3 sm:px-4 rounded-full shadow-lg bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
              >
                <span class="text-sm sm:text-base">Next</span>
                <ArrowRightIcon class="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
        <Button
            v-if="isCalibrating"
            @click="skipToHome"
            class="fixed bottom-2 right-2 bg-gray-600/50 hover:bg-gray-700 dark:hover:text-white text-white px-6 py-2 dark:text-gray-500 rounded-full shadow-lg flex items-center gap-2"
          >
            <span>Skip</span>
            <ArrowRightIcon class="h-5 w-5" />
          </Button>
      </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { MicrophoneIcon, PlayIcon, PauseIcon, ArrowRightIcon, CheckIcon } from '@heroicons/vue/24/solid'
import { ReloadIcon } from '@radix-icons/vue'
import { useTranscription } from '@/composables/useTranscription'

let RecordRTC: any
if (process.client) {
  RecordRTC = (await import('recordrtc')).default
}
const { transcription, interimTranscription, connect, sendAudioChunk, disconnect } = useTranscription()

// Update the watch function to handle both interim and final results
watch([transcription, interimTranscription], ([newTranscription, newInterim]) => {
  const textToProcess = newInterim || newTranscription
  if (textToProcess) {
    processSpeech(textToProcess)
    }
})

const Url = 'wss://dyslexai-gvbfgqdkdkg0dwhw.canadacentral-01.azurewebsites.net/ws/transcribe'
const startTranscription = () => {  // Opens websocket connection to your Azure transcription endpoint.
  connect(Url)
}

const showUserInfoDialog = ref(true)
const isPaused = ref(false)
const userInfo = ref({
  username: '',
  age: null,
  school: ''
})
const userId = ref(null)

const isFormComplete = computed(() => {
  return userInfo.value.username?.trim()
})

const submitUserInfo = async () => {
  //userId.value = localStorage.getItem('userId')
  /*if (userId.value) {
    showUserInfoDialog.value = false
    showDialog.value = true
    return
  }*/
  try {
    const response = await axios.post('https://dyslexai-gvbfgqdkdkg0dwhw.canadacentral-01.azurewebsites.net/demo-signup', {
      username: userInfo.value.username,
      age: 10
    })
    
    // Store user info for later use
    userId.value = response.data.id
    localStorage.setItem('userId', response.data.id)
    localStorage.setItem('username', response.data.username)
    localStorage.setItem('age', 10)
    localStorage.setItem('school', 'none')
    const initialResults = {
      wpm: [],
      errors: [],
      userId: response.data.id,
      username: response.data.username,
      age: userInfo.value.age
    }
    localStorage.setItem('readingResults', JSON.stringify(initialResults))
    
    // Hide user info dialog and show calibration dialog
    showUserInfoDialog.value = false
    showDialog.value = true
    startCalibration()
  } catch (error) {
    console.error('Error saving user info:', error)
  }
}

const router = useRouter()
const showDialog = ref(true)
const isCalibrating = ref(false)
const currentParagraph = ref(1)
const isRecording = ref(false)
const showCountdown = ref(false)
const countdown = ref('')
const recordingSeconds = ref(0)
const recordingInterval = ref(null)

const paragraphs = [
"Lexy saw the world a bit differently than others. She struggled with different alphabets beneath bright moonlight. Her knowledge seemed scrambled as mysterious letters danced across ancient scrolls. Professor Nightwing noticed special patterns in Lexy's peculiar solutions. Her scientific mind transformed confusing symbols into beautiful pictures, stretching beyond traditional methods.",
  "While friends brought ordinary books, Lexy discovered extraordinary pathways through mathematics and puzzles. She gracefully wove numbers with letters, creating unexpected connections. Phenomenal ideas sparkled in her imagination. Separate pieces merged into brilliant solutions. The peaceful night echoed with her delighted hoots.",
  "Between twinkling stars, Lexy now teaches struggling owlets with her unique techniques. Her methods surprised skeptical professors, bringing fresh hope to countless young minds. Through her success, she proves that different thinking creates exceptional achievements. Her magical classroom welcomes every owl who sees words differently."
]

let recorder = ref(null)
let stream = ref(null)

const skipCalibration = () => {
  router.push('/home')
}

const startCalibration = () => {
  isCalibrating.value = true
  initializeWordProgress()
}
const startCountdown = () => {
  showCountdown.value = true
  countdown.value = 'Ready?'
  setTimeout(() => {
    startRecording()
    countdown.value = 'Go!'
    setTimeout(() => {
      showCountdown.value = false
    }, 1000)
  }, 2000)
}


const handlePlayPause = () => {
  if (!isRecording.value) {
    startCountdown()
  } else {
    if (isPaused.value) {
      // Resume recording and timer
      isPaused.value = false
      recordingInterval.value = setInterval(() => {
        recordingSeconds.value++
      }, 1000)
      recognition.value.start()
      recorder.value.resumeRecording()
    } else {
      // Pause recording and timer
      isPaused.value = true
      clearInterval(recordingInterval.value)
      recordingInterval.value = null
      recognition.value.stop()
      recorder.value.pauseRecording()
      disconnect()
    }
  }
}

const recognition = ref<any>(null)
const wordProgress = ref<{word: string, isRead: boolean, timestamp: number}[]>([])
const isParaComplete = ref(false)

const currentPosition = ref(0)
const transcriptBuffer = ref('')
const lookAheadWindow = 5

const initializeWordProgress = () => {
  const words = paragraphs[currentParagraph.value - 1].split(' ')
  wordProgress.value = words.map((word, index) => ({
    word,
    isRead: false,
    timestamp: 0,
    originalIndex: index
  }))
}
// Process recognized speech to find matching words
const processSpeech = (transcript: string) => {
  transcriptBuffer.value = (transcriptBuffer.value + ' ' + transcript.toLowerCase()).slice(-200)
  
  let wordsToProcess = wordProgress.value.slice(currentPosition.value)
  
  // Process remaining words even if fewer than lookAheadWindow
  const windowSize = Math.min(wordsToProcess.length, lookAheadWindow)
  
  for (let i = 0; i < windowSize; i++) {
    const wordToMatch = wordsToProcess[i].word.toLowerCase()
    const position = currentPosition.value + i
    
    if (hasCommonCharacters(wordToMatch, transcriptBuffer.value)) {
      let count = 0
      for (let j = currentPosition.value; j <= position; j++) {
        wordProgress.value[j].isRead = true
        wordProgress.value[j].timestamp = Date.now()
        count++
      }
      currentPosition.value += count || 1
      
      // Check if we're at the last word
      if (currentPosition.value >= wordProgress.value.length - 1) {
        wordProgress.value[wordProgress.value.length - 1].isRead = true
        currentPosition.value = wordProgress.value.length
        isParaComplete.value = true
        setTimeout(() => {
          stopRecording()
        }, 700)
        break
      }
    }
  }
}

const skipToHome = () => {
  // Stop any ongoing recording
  if (isRecording.value) {
    stopRecording()
  }
  
  // Clear any active streams or recorders
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
  }
  
  // Navigate to home
  router.push('/home')
}

const hasCommonCharacters = (word: string, buffer: string): boolean => {
  const normalizedWord = word.toLowerCase()
  const recentBuffer = buffer.split(' ').slice(-3).join(' ')
  
  // For words with 3 or fewer characters, check exact match
  if (normalizedWord.length <= 3) {
    return recentBuffer.includes(normalizedWord)
  }

  console.log(normalizedWord, recentBuffer, "this is how it is checking")
  // Check if first 3 characters appear in sequence in recent buffer
  const firstThreeChars = normalizedWord.substring(0, 3)
  return recentBuffer.includes(firstThreeChars)
}
const isWordRead = (word: string, index: number): boolean => {
  return index <= currentPosition.value && wordProgress.value[index].isRead
}

const retryParagraph = () => {
  isParaComplete.value = false
  currentPosition.value = 0
  transcriptBuffer.value = ''
  initializeWordProgress()
  isRecording.value = false
  if (recorder.value) {
    recorder.value.stopRecording()
  }
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
  }
  recorder.value = null
  stream.value = null
  startCountdown()
}

const handleNext = () => {
  if (!isParaComplete.value) return
  
  if (currentParagraph.value < 3) {
    currentParagraph.value++
    retryParagraph()
  } else {
    finishCalibration()
  }
}

const handleDone = () => {
  stopRecording()
  isParaComplete.value = true
  if (currentParagraph.value < 3) {
    currentParagraph.value++
    retryParagraph()
  } else {
    finishCalibration()
  }
}

const setupSpeechRecognition = () => {
  if (!process.client) return
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition.value = new SpeechRecognition()
  recognition.value.continuous = true
  recognition.value.interimResults = true
  
  // Adjust properties for faster recognition
  recognition.value.maxAlternatives = 1
  
  recognition.value.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      processSpeech(transcript)
    }
  }
  
  recognition.value.onend = () => {
    // Only restart if we're still supposed to be recording
    if (isRecording.value) {
      // Add a small delay before restarting to prevent rapid restarts
      setTimeout(() => {
        recognition.value.start()
      }, 100)
    }
  }

  // Add error handler to catch and handle recognition errors
  recognition.value.onerror = (event: any) => {
    console.log('Speech recognition error:', event.error)
    // Restart recognition on recoverable errors
    if (event.error !== 'aborted' && isRecording.value) {
      setTimeout(() => {
        recognition.value.start()
      }, 100)
    }
  }
}


const startRecording = async () => {
  if (!process.client) return
  
  disconnect()
  startTranscription()

  try {
    isPaused.value = false
    recordingSeconds.value = 0
    recordingInterval.value = setInterval(() => {
      recordingSeconds.value++
    }, 1000)
    stream.value = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 44100,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      }
    })

    recorder.value = new RecordRTC(stream.value, {
      type: 'audio',
      mimeType: 'audio/wav',
      recorderType: RecordRTC.StereoAudioRecorder,
      numberOfAudioChannels: 1,
      checkForInactiveTracks: true,
      timeSlice: 250, // Send chunks every 250ms for more real-time experience
      ondataavailable: (blob) => {
        blob.arrayBuffer().then(buffer => {
          sendAudioChunk(buffer)
        })
      }
    })

    recorder.value.startRecording()
    isRecording.value = true
    
  } catch (error) {
    console.error('Error accessing microphone:', error)
  }
}

const stopRecording = () => {
  if (!recorder.value || !stream.value) return

  clearInterval(recordingInterval.value)
  recordingInterval.value = null
  
  disconnect()
  
  recorder.value.stopRecording(() => {
    const blob = recorder.value.getBlob()
    sendRecording(blob)
    
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
    recorder.value = null
    isRecording.value = false
    isParaComplete.value = true 
  })
}
const parseErrors = (errors) => {
  return errors.map(error => error.word.toLowerCase())
}

const sendRecording = async (audioBlob: Blob) => {
  try {
    const formData = new FormData()
    formData.append('file', audioBlob, 'recording.wav')
    formData.append('text', paragraphs[currentParagraph.value - 1])
    formData.append('user_id', localStorage.getItem('userId'))


    const response = await axios.post('https://dyslexai-gvbfgqdkdkg0dwhw.canadacentral-01.azurewebsites.net/test-reading', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    // Get existing results
    const results = JSON.parse(localStorage.getItem('readingResults'))
    
    // Update with new data
    results.wpm.push(response.data.wpm)
    const parsedErrors = parseErrors(response.data.errors)
    results.errors.push(...parsedErrors)
    
    // Save back to localStorage
    localStorage.setItem('readingResults', JSON.stringify(results))

  } catch (error) {
    console.error('Error sending recording:', error)
  }
}

const finishCalibration = () => {
  router.push('/home')
}
</script>
