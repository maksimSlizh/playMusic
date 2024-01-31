const gridContainer = document.getElementById('grid-container')
const audioInput = document.getElementById('audioInput')
const audio = document.getElementById('audioPlayer')

let context
let analyser
let source

audioInput.addEventListener('change', (event) => {
  audio.src = URL.createObjectURL(event.target.files[0])
  audio.load()
})

function onClick() {
  console.log('clicked')
  if (!context) {
    audioContext()
  }
  if (audio.paused) {
    audio.play()
    loop()
  } else {
    audio.pause()
  }
}

function createGrid(size) {
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const note = document.createElement('div')
      note.className = 'grid-note'
      gridContainer.appendChild(note)
    }
  }
}

function audioContext() {
  if (!context) {
    context = new AudioContext()
    analyser = context.createAnalyser()
    source = context.createMediaElementSource(audio)
    source.connect(analyser)
    analyser.connect(context.destination)
    loop()
  }
}

function loop() {
  if (!audio.paused) {
    window.requestAnimationFrame(loop)
  }

  analyser.fftSize = 256

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.getByteFrequencyData(dataArray)

  for (let i = 0; i < gridContainer.children.length; i++) {
    gridContainer.children[i].style.backgroundColor = `rgb(${dataArray[i]}, ${dataArray[i]}, ${dataArray[i]})`
  }
}

createGrid(6)
