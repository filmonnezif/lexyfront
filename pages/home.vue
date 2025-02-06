<template>
  <div class="min-h-screen bg-purple-50 dark:bg-gray-900 p-2 md:p-8 relative">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-[550px] md:h-[300px] overflow-y-auto overflow-x-hidden mb-2 ">
      <!-- Left Column: User Profile + Practice Words -->
          <Card class="h-full bg-white/50 dark:bg-gray-800/50 backdrop-blur">
            <CardContent>
            <!-- Guest View -->
            <div v-if="isDefaultUser" class="text-center py-2 md:py-8">
              <div class="mb-2 md:mb-4">
                <UserIcon class="w-10 h-8 md:w-14 md:h-14 mx-auto text-purple-500 opacity-50" />
              </div>
              <h3 class="md:text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 md:mb-4">
                Personalize Your Reading Experience
              </h3>
              <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-2 md:mb-6">
                Complete a quick calibration to help us personaliz your experience. 
              </p>
              <Button 
                @click="signupAndCalibrate" 
                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-full transition-all text-sm md:text-base"
              >
                Get Started
              </Button>
            </div>

            <!-- Logged In User View -->
            <div v-else class="space-y-2">
              <!-- User Profile Card -->
              <div class="flex flex-col h-full">
                <!-- Top Section: Name and Speed side by side -->
                <div class="flex items-center justify-between mb-2 px-4 py-2 bg-purple-50/50 dark:bg-gray-800/50 rounded-xl">
                  <!-- User info -->
                  <div class="flex items-center gap-2">
                    <UserIcon class="w-6 h-6 text-purple-600" />
                    <h3 class="text-lg md:text-base">{{ username }}</h3>
                  </div>
                  <!-- WPM Stats -->
                  <div class="flex items-center gap-2">
                    <div class="text-2xl md:text-xl font-bold text-purple-600">
                      {{ calculateAverageWPM() }}
                      <span class="text-sm md:text-xs">WPM</span>
                    </div>
                    <DotLottieVue 
                      class="h-12 w-12 md:h-10 md:w-10"
                      autoplay
                      loop
                      :speed="calculateAnimationSpeed()"
                      src="https://lottie.host/9ebed050-824d-446b-93a1-3f65e4792342/ePzyWsOlMh.lottie"
                    />
                  </div>
                </div>

                <!-- Bottom Section: Scrollable Practice Words -->
                <div class="flex-1 overflow-y-auto">
                  <div class="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                    <h4 class="text-sm font-medium mb-2">Words to Practice</h4>
                    <div class="flex flex-wrap gap-1 max-h-[150px] overflow-y-auto">
                      <span 
                        v-for="error in errors"
                        :key="error"
                        class="px-2 py-1 text-xs md:text-[10px] bg-purple-100 text-purple-700 rounded-full"
                      >
                        {{ error }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </CardContent>
          </Card>
          <!-- Analytics Section -->
          <Card class="h-full bg-white/50 dark:bg-gray-800/50 backdrop-blur">
            <CardContent>
              <h4 class="md:text-lg font-medium text-gray-700 dark:text-gray-300">
                Progress Analytics
                <span class="text-sm text-gray-500 dark:text-gray-400"> (Mock data)</span>
              </h4>
              <div class="grid md:grid-cols-2 gap-1 grid-cols-1">
                <!-- Reading Speed Progress Chart -->
                <v-chart class="h-32 md:h-40" :option="speedProgressOption" />
                
                <!-- Error Types Chart -->
                <v-chart class="h-32 md:h-40" :option="accuracyOption" />
              </div>
              <div class="mt-2 flex items-center gap-1 overflow-x-auto py-1">
      <div v-for="badge in badges" :key="badge.id" 
        class="flex-shrink-0 flex items-center bg-purple-100/50 dark:bg-purple-900/30 rounded-full px-2 py-0.5"
        :title="badge.description">
        <span class="text-base mr-1">{{badge.icon}}</span>
        <span class="text-xs font-medium text-purple-700 dark:text-purple-300 whitespace-nowrap">{{badge.title}}</span>
      </div>
    </div>
            </CardContent>
          </Card>
        </div>


    <div class="text-xl font-medium text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700 pb-2 mb-4 mt-4">
        Documents ({{ documents.length }})
      </div>
    <!-- Document Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="doc in [...documents].reverse()"
        :key="doc.id"        
        class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 md:p-4"
        @click="navigateToRead(doc.extractedText, doc.fileName)"

      >
        <!-- Existing card content with smaller text -->
        <div class="flex items-center gap-2 mb-2">
          <FileIcon class="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
          <h4 class="text-sm md:text-base font-medium">
            {{ doc.fileName.length > 30 
              ? doc.fileName.substring(0, 15) + '...' + doc.fileName.substring(doc.fileName.length - 7) 
              : doc.fileName 
            }}
          </h4>
        </div>
        <div class="flex items-center text-gray-600 dark:text-gray-400 text-sm">
          <p class="mr-2">click to read</p>
          <CursorArrowRaysIcon class="w-5 h-5 text-purple-400" />
        </div>
      </div>
    </div>
    <div v-if="!(documents.length > 3) " class="relative my-8 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center space-y-4">
      <h3 class="text-xl font-medium text-gray-700 dark:text-gray-300">
        <a href="#" @click.prevent="openUploadDialog">
          Try taking a picture or uploading a document.
        </a>
      </h3>
    </div>
    <div v-if="isUploading" class="absolute inset-0 bg-black/70 flex items-center justify-center">
      <div class="text-center absolute top-20 space-x-auto">
        <div class="flex justify-center">
          <DotLottieVue
            src="https://lottie.host/6c4907b2-9639-4793-a854-2ca01b6605ae/t6I34zQoqp.lottie"
            autoplay
            loop
            style="width: 300px; height: 300px"
          />
        </div>
        <h2 class="text-white text-xl mt-4">{{ uploadMessage }}</h2>
      </div>
    </div>   
    <div class="fixed bottom-20 left-1/2 transform -translate-x-1/2 flex justify-center">
    <Button
      variant="default"
      size="icon"
      class="h-14 w-14 rounded-full shadow-lg animate-float bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
      @click="openUploadDialog"
    >
      <PlusIcon class="h-10 w-10" />
    </Button>
    </div>

    <!-- Upload Dialog -->
    <Dialog v-model:open="showUploadDialog">
      <DialogContent class="sm:max-w-[600px] bg-purple-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 ">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription class="text-gray-600 dark:text-gray-400">
            You can upload "words, pdfs, presentations, and images"
          </DialogDescription>
        </DialogHeader>
        
        <div 
          class="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center"
          @drop.prevent="handleDrop"
          @dragover.prevent
          @dragenter.prevent
        >
          <UploadIcon class="w-12 h-12 mx-auto text-purple-400 mb-4" />
          <p class="mb-2">Drag and drop your files here, or</p>
          <Button variant="link" @click="openFileDialog " class = "bg-purple-50 dark:bg-gray-900 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300">
            <PlusIcon class="w-4 h-4 mr-1" />
            click here
          </Button>
        </div>
  
        <!-- Text Input -->
        <div class="mt-4">
          <Label>Or paste your text</Label>
          <Textarea
            v-model="textInput"
            placeholder="Paste your text here..."
            class="mt-2"
            rows="4"
          />
        </div>

        <DialogFooter>
          <Button class = "bg-purple-50 dark:bg-gray-900 dark:hover:bg-gray-600" variant="outline" @click="showUploadDialog = false">
            Cancel
          </Button>
          <Button
            class = "bg-purple-50 dark:bg-gray-900 dark:hover:bg-gray-600"
            variant="outline"
            :disabled="!textInput.trim()"
            @click="handleTextSubmit"
          >
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>


    <!-- Hidden File Input -->
    <input
      type="file"
      ref="fileInput"
      @change="handleFileSelect"
      accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff,.heif,.docx,.xlsx,.pptx"
      class="hidden"
    >
    <Drawer v-model:open="showDrawer">
      <DrawerContent class="bg-purple-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
        <DrawerHeader>
          <DrawerTitle>Choose an option</DrawerTitle>
        </DrawerHeader>
        <div class="grid gap-4 p-4">
          <Button variant="outline" @click="openCamera" class = "bg-purple-50 dark:bg-gray-900 dark:hover:bg-gray-600"
          >
            <CameraIcon class="mr-2 h-4 w-4" />
            Take Picture
          </Button>
          <Button variant="outline" @click="openFilePicker" class = "bg-purple-50 dark:bg-gray-900 dark:hover:bg-gray-600"
          >
            <FilePlusIcon class="mr-2 h-4 w-4" />
            Choose File
          </Button>
          <Button variant="outline" @click="openTextInput" class = "bg-purple-50 dark:bg-gray-900 dark:hover:bg-gray-600"
          >
            <PlusIcon class="mr-2 h-4 w-4" />
            Add Text
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
    <Dialog v-model:open="showUploadDialogText">
      <DialogContent class="sm:max-w-[600px] bg-purple-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 ">
        <DialogHeader>
          <DialogTitle>Paste your text</DialogTitle>
          <DialogDescription class="text-gray-600 dark:text-gray-400">
          </DialogDescription>
        </DialogHeader>
          <Textarea
            v-model="textInput"
            placeholder="Paste your text here..."
            class="mt-2"
            rows="4"
          />
        <DialogFooter>
          <Button class = "bg-purple-50 dark:bg-gray-900 dark:hover:bg-gray-600" variant="outline" @click="showUploadDialogText = false">
            Cancel
          </Button>
          <Button
            class = "bg-purple-50 dark:bg-gray-900 dark:hover:bg-gray-600"
            variant="outline"
            :disabled="!textInput.trim()"
            @click="handleTextSubmit"
          >
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted } from 'vue'
import { PlusIcon, FileIcon, UploadIcon } from '@radix-icons/vue'
import { CameraIcon, FilePlusIcon } from '@radix-icons/vue'
import axios from 'axios'
import showdown from 'showdown'
import { CursorArrowRaysIcon,  UserIcon } from '@heroicons/vue/24/outline'
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'


const badges = ref([
  {
    id: 1,
    icon: '🏃',
    title: 'Swift Reader',
    description: 'Read 100+ words per minute!'  },
  {
    id: 2,
    icon: '🎯',
    title: 'Accuracy Master',
    description: '95% reading accuracy achieved'
  },
  {
    id: 3,
    icon: '📚',
    title: 'Bookworm',
    description: 'Completed 5 documents'
  },
  {
    id: 4,
    icon: '⭐',
    title: 'Rising Star',
    description: 'Improved speed by 20%'
  }
])


const username = ref('')
const age = ref('')
const calculateAverageWPM = () => {
  const results = JSON.parse(localStorage.getItem('readingResults') || '{"wpm":[]}')
  const wpmArray = results.wpm
  if (!wpmArray.length) return 0
  return Math.round(wpmArray.reduce((a, b) => a + b, 0) / wpmArray.length)
}
const calculateAnimationSpeed = () => {
  const avgWPM = calculateAverageWPM()
  return avgWPM / 100
} 

onMounted(() => {
  username.value = localStorage.getItem('username') || ''
  age.value = localStorage.getItem('age') || ''
})

const isDefaultUser = computed(() => {
  return username.value.trim() === '' || Number(age.value) === 0
})

// Function to navigate to calibrate page
const signupAndCalibrate = () => {
  router.push('/calibrate')
}

const errors = computed(() => {
  const results = JSON.parse(localStorage.getItem('readingResults') || '{"errors":[]}')
  return results.errors
})

const converter = new showdown.Converter()

const documents = ref([
  {
    id: 1,
    fileName: 'Photosynthesis',
    extractedText: "<h1>Photosynthesis:</h1> <p>Photosynthesis, an intricate and multifarious biochemical enterprise, constitutes the quintessential paradigm of energy transduction, wherein electromagnetic radiation from solar influx is meticulously captured, transmuted, and sequestered into organic chemical moieties, primarily in the form of glucose, through a labyrinthine cascade of enzymatic and physicochemical processes. This phenomenological occurrence transpires predominantly within chloroplasts, which are eukaryotic organelles characterized by their bilayer membranes and their possession of an internalized thylakoid architecture.</p><p>Within the thylakoid membrane’s lipid-protein matrix, one encounters a constellation of photosynthetic pigment assemblies, prominently inclusive of chlorophyll molecules and accessory pigments such as carotenoids. These pigmentary complexes orchestrate the initial photonic excitation, wherein photons elevate electrons to a higher quantum energy state. This initiatory event, localized within photosystem II (PSII) via P680 reaction centers, catalyzes the photolytic cleavage of water molecules—a reaction known as oxygenic photolysis—thereby liberating dioxygen (O₂), protons, and electrons.</p><p>The liberated electrons traverse an elaborate electron transport chain (ETC) embedded in the thylakoid membrane, encompassing intermediary complexes such as plastoquinone (PQ), cytochrome b6f, and plastocyanin (PC). This electron flux generates a proton motive force across the thylakoid lumen, engendering an electrochemical gradient utilized by ATP synthase to phosphorylate adenosine diphosphate (ADP) into adenosine triphosphate (ATP), a pivotal energy currency molecule.</p><p>Concomitantly, photosystem I (PSI), with its P700 reaction centers, operates in a tandem photophosphorylation schema, culminating in the reduction of nicotinamide adenine dinucleotide phosphate (NADP⁺) to form reduced NADPH. These reductive and energetic outputs are indispensable substrates for the subsequent light-independent reactions.</p><p>In the stroma, the Calvin-Benson-Bassham cycle operates as a carboxylative, reductive, and regenerative tri-phasic mechanism whereby ribulose-1,5-bisphosphate (RuBP) is enzymatically carboxylated via ribulose bisphosphate carboxylase-oxygenase (RuBisCO) to yield an unstable six-carbon intermediate that promptly bifurcates into two molecules of 3-phosphoglycerate (3-PGA). Through ATP-mediated phosphorylation and NADPH-dependent reduction, 3-PGA is transmuted into glyceraldehyde-3-phosphate (G3P), a precursor for hexose synthesis.</p><p>Iterative cycling regenerates RuBP, thereby perpetuating the assimilation of carbon dioxide in a feedback-driven metabolic cycle. Thus, photosynthesis operates as a keystone anabolic pathway underpinning autotrophic viability, ecological equilibrium, and the bioenergetic sustenance of heterotrophic organisms across trophic hierarchies.</p>",
  },
  {
    id: 2,
    fileName: 'Nokia`s Future ', 
    extractedText: '<h1>Nokia`s Technological Evolution</h1> <h2>Embracing the Metaverse</h2><p>Nokia`s metamorphosis epitomizes a quintessential paradigm shift. The company`s strategic initiatives encompass a plethora of multifaceted endeavors, each contributing to its overarching objective of technological preeminence.</p><h2>Advancements in Web3 and Blockchain</h2><p>Concurrently, Nokia is delving into the realm of Web3, a decentralized iteration of the internet predicated on blockchain technology. This initiative underscores the company`s dedication to fostering a more egalitarian digital ecosystem, wherein data sovereignty and user autonomy are paramount. The esoteric nature of blockchain integration presents a labyrinthine challenge, yet Nokia`s resolve remains unwavering.</p><h2>Artificial Intelligence Integration</h2><p>In the domain of artificial intelligence, Nokia is orchestrating the integration of machine learning algorithms into its network operations. This stratagem aims to augment operational efficiency through predictive analytics and automated optimization.</p>',
  },
  {
    id: 3,
    fileName: 'Dyslexia',
    extractedText: '<h1>Understanding Dyslexia</h1><p>Dyslexia is a neurological condition that affects an individual’s ability to read, write, and spell, despite normal intelligence and adequate educational opportunities. This condition is classified as a specific learning disorder and is often characterized by difficulties in phonological processing, which refers to the ability to break down and manipulate the sounds in language.</p><p>The etiology of dyslexia involves a confluence of genetic and environmental factors, often implicating atypical neural activation in regions such as the left temporal lobe. Neuroimaging studies reveal that individuals with dyslexia exhibit diminished connectivity in areas responsible for decoding orthographic symbols and mapping them to corresponding phonemes. Despite these challenges, dyslexia does not correlate with cognitive deficits; many individuals with this condition demonstrate exceptional creativity and problem-solving abilities.</p><p>Intervention strategies for dyslexia often involve structured literacy programs that employ multisensory techniques. These methodologies integrate visual, auditory, and kinesthetic modalities to reinforce neural pathways, facilitating more effective acquisition of reading skills. Moreover, assistive technologies such as text-to-speech software and immersive readers can significantly ameliorate the challenges faced by dyslexic individuals, enabling them to access information and improve comprehension.</p><p> Public awareness and accommodations are essential to ensure equitable educational experiences for individuals with dyslexia. By fostering an inclusive environment and leveraging innovative pedagogical tools, society can mitigate the stigmatization often associated with this condition and empower those affected to achieve their full potential.</p>',
  }
])
const textInput = ref('')
const showUploadDialog = ref(false)
const showUploadDialogText = ref(false)
const fileInput = ref(null)
const isUploading = ref(false)
const uploadProgress = ref(0)

const showDrawer = ref(false)
const isMobile = ref(false)

const uploadMessage = ref('')

const messages = [
  'Uploading your document...',
  'Extracting text content...',
  'Converting to readable format...',
]

watchEffect((cleanupFn) => {
  if (isUploading.value) {
    let messageIndex = 0
    const messageInterval = setInterval(() => {
      uploadMessage.value = messages[messageIndex]
      messageIndex = (messageIndex + 1) % messages.length
    }, 2000)

    cleanupFn(() => {
      clearInterval(messageInterval)
    })
  }
})

onMounted(() => {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent)
})

const openUploadDialog = () => {
  if (isMobile.value) {
    showDrawer.value = true
  } else {
    showUploadDialog.value = true
  }
}

const openFileDialog = () => {
  fileInput.value.click()
}

const handleDrop = async (e) => {
  const droppedFiles = [...e.dataTransfer.files]
  await processFiles(droppedFiles)
}

const handleFileSelect = async (e) => {
  const selectedFiles = [...e.target.files]
  await processFiles(selectedFiles)
}


const processFiles = async (files) => {
  showUploadDialog.value = false
  isUploading.value = true
  for (const file of files) {
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/bmp',
      'image/tiff',
      'image/heif',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]

    if (validTypes.includes(file.type)) {
      isUploading.value = true
      uploadProgress.value = 0
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await axios.post(
          'https://dyslexai-gvbfgqdkdkg0dwhw.canadacentral-01.azurewebsites.net/extract-text', 
          formData, 
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )
        
        // Set to 100% when complete
        uploadProgress.value = 100
        isUploading.value = false

        documents.value.push({
        id: Date.now(),
        fileName: file.name,
        extractedText: converter.makeHtml(response.data.text),
        file: file
      })
      } catch (error) {
        console.error('Error extracting text:', error)
      } finally {
        isUploading.value = false
        uploadProgress.value = 0
      }
    }
  }
}

const handleTextSubmit = () => {
  if (textInput.value.trim()) {
    documents.value.push({
      id: Date.now(),
      fileName: 'Text Document',
      extractedText: textInput.value,
    })
    textInput.value = ''
    showUploadDialog.value = false
    showUploadDialogText.value = false
  }
}

const router = useRouter()

const navigateToRead = (text, fileName) => {
  const htmlContent = converter.makeHtml(text)
  router.push({
    path: '/str',
    query: { text: htmlContent, fileName: fileName }
  })
}

const openCamera = () => {
  showDrawer.value = false
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.capture = 'environment'
  input.onchange = (e) => handleFileSelect(e)
  input.click()
}

const openFilePicker = () => {
  showDrawer.value = false
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.pdf,.jpg,.jpeg,.png,.bmp,.tiff,.heif,.docx,.xlsx,.pptx'
  input.onchange = (e) => handleFileSelect(e)
  input.click()
}


const openTextInput = () => {
  showDrawer.value = false
  showUploadDialogText.value = true
}


use([
  CanvasRenderer,
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent
])

// Sample data 
const speedProgressOption = ref({
  tooltip: {
    trigger: 'axis',
    formatter: '{b}: {c} WPM',
    extraCssText: 'text-xs'
  },
  grid: {
    top: '12%',
    left: '8%',
    right: '4%',
    bottom: '12%'
  },
  xAxis: {
    type: 'category',
    data: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    axisLabel: { fontSize: 8

     }
  },
  yAxis: {
    type: 'value',
    name: 'WPM',
    nameTextStyle: { fontSize: 8

     },
    axisLabel: { fontSize: 8

     }
  },
  series: [{
    data: [65, 72, 70, 78, 82, 85, 89],
    type: 'line',
    smooth: true,
    lineStyle: { width: 2 },
    itemStyle: { color: '#9333ea' },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: '#9333ea33' },
          { offset: 1, color: '#9333ea00' }
        ]
      }
    }
  }]
})

const accuracyOption = ref({
  tooltip: {
    trigger: 'axis',
    formatter: '{b}: {c} errors',
    extraCssText: 'text-xs'
  },
  grid: {
    top: '12%',
    left: '8%',
    right: '4%',
    bottom: '12%'
  },
  xAxis: {
    type: 'category',
    data: ['Omission', 'Insertion', 'Hesitation'],
    axisLabel: { fontSize: 8
      , interval: 0 }
  },
  yAxis: {
    type: 'value',
    name: 'Count',
    nameTextStyle: { fontSize: 8

     },
    axisLabel: { fontSize: 8

     }
  },
  series: [{
    data: [5, 3, 7],
    type: 'bar',
    itemStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: '#9333ea' },
          { offset: 1, color: '#c084fc' }
        ]
      }
    }
  }]
})


</script>

<style scoped>
.v-chart {
  background: transparent;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid rgba(156, 163, 175, 0.2);
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.scrollable-accordion {
  max-height: calc(100vh - 300px); /* Adjust based on your card's position */
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #9333ea #f3f4f6;
}

.scrollable-accordion::-webkit-scrollbar {
  width: 6px;
}

.scrollable-accordion::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.scrollable-accordion::-webkit-scrollbar-thumb {
  background-color: #9333ea;
  border-radius: 3px;
}

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
  
  .animate-float {
    animation: float 4s ease-in-out infinite;
  }
</style>
