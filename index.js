const audioElement = document.getElementById('audio');
const canvasElement = document.getElementById('canvas');

audioElement.addEventListener('change', (event) => {
    const file = event.target.files[0];

    const reader = new FileReader();

    reader.addEventListener('load', (event) => {
        const arrayBuffer = event.target.result;

        const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();

        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
            visualize(audioBuffer, audioContext);
        });
    });

    reader.readAsArrayBuffer(file);
});

function visualize(audioBuffer, audioContext) {
    canvasElement.width = canvasElement.clientWidth;
    canvasElement.height = canvasElement.clientHeight;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const frequencyBufferLength = analyser.frequencyBinCount;
    const frequencyData = new Uint8Array(frequencyBufferLength);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    source.start();

    const canvasContext = canvasElement.getContext('2d');

    const barWidth = canvasElement.width / frequencyBufferLength;

    function draw() {
        requestAnimationFrame(draw);
        canvasContext.fillStyle = 'rgb(173, 216, 230)';
        canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height);

        analyser.getByteFrequencyData(frequencyData);

        for (let i = 0; i < frequencyBufferLength; i++) {
            canvasContext.fillStyle = 'rgb(' + frequencyData[i] + ',118, 138)';
            canvasContext.fillRect(
                i * barWidth,
                canvasElement.height - frequencyData[i],
                barWidth - 1,
                frequencyData[i]
            );
        }
    }

    draw();
}
