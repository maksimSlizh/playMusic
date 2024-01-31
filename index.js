document.addEventListener('DOMContentLoaded', function () {
  let audioContext
  let analyser
  let source
  let isPlaying = false
  let animationId

  function createGrid(size) {
    const gridContainer = document.getElementById('grid-container')
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const note = document.createElement('div')
        note.className = 'grid-note'
        gridContainer.appendChild(note)
      }
    }
  }

  window.loadAudio = function () {
    const audioInput = document.getElementById('audioInput')
    const audioPlayer = document.getElementById('audioPlayer')

    stopAudio()

    audioContext = new (window.AudioContext)()
    analyser = audioContext.createAnalyser()

    const file = audioInput.files[0]
    const fileReader = new FileReader()

    fileReader.onload = function (event) {
      audioContext.decodeAudioData(event.target.result, function (buffer) {
        source = audioContext.createBufferSource()
        source.buffer = buffer

        source.connect(analyser);
        analyser.connect(audioContext.destination)

        analyser.fftSize = 256

        audioPlayer.src = URL.createObjectURL(file)
        audioPlayer.style.display = 'block'


        audioPlayer.addEventListener('play', function () {
          playAudio()
          visualizeAudio()
        })
        audioPlayer.addEventListener('pause', function () {
          pauseAudio()
        })
        audioPlayer.addEventListener('ended', function () {
          stopAudio()
        })
        audioPlayer.addEventListener('timeupdate', function () {
          visualizeAudio()
        })
      })
    }

    fileReader.readAsArrayBuffer(file)
  }

  function playAudio() {
    if (!isPlaying) {
      if (!source) {
        source = audioContext.createBufferSource()
        source.buffer = audioContext.createBuffer(1, 1, 22050)
        source.connect(analyser)
        analyser.connect(audioContext.destination)
      }

      source.start(0)
      isPlaying = true
      animate()
    }
  }

  function pauseAudio() {
    if (isPlaying) {
      source.stop()
      isPlaying = false
      cancelAnimationFrame(animationId)
    }
  }

  function stopAudio() {
    if (source) {
      source.stop()
      source.disconnect()
      source = null
    }

    if (isPlaying) {
      isPlaying = false
      cancelAnimationFrame(animationId)
    }

    if (analyser) {
      analyser.disconnect()
    }

    if (audioContext) {
      audioContext.close()
    }
  }

  function visualizeAudio() {
    const gridNotes = document.querySelectorAll('.grid-note')
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    analyser.getByteFrequencyData(dataArray)

    gridNotes.forEach((note, index) => {
      const value = dataArray[index]
      note.style.backgroundColor = `rgb(0, ${value * 2}, 0)`
    })
  }

  function animate() {
    visualizationId = requestAnimationFrame(animate)
    visualizeAudio()
  }

  createGrid(6)
})
