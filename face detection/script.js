const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");

let totalBlinkCount = 0;
let blinkCountThisSecond = 0;
let lastBlinkTime = 0;
let blinkThreshold = 0.2;

let blinkRate = 0;

// Calculate Eye Aspect Ratio
function calculateEAR(landmarks, eyeIndices) {
    function distance(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y);
    }

    const p1 = landmarks[eyeIndices[0]];
    const p2 = landmarks[eyeIndices[1]];
    const p3 = landmarks[eyeIndices[2]];
    const p4 = landmarks[eyeIndices[3]];
    const p5 = landmarks[eyeIndices[4]];
    const p6 = landmarks[eyeIndices[5]];

    const vertical1 = distance(p2, p6);
    const vertical2 = distance(p3, p5);
    const horizontal = distance(p1, p4);

    return (vertical1 + vertical2) / (2.0 * horizontal);
}

const faceMesh = new FaceMesh({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

faceMesh.onResults(results => {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        const leftEye = [33, 160, 158, 133, 153, 144];

        let ear = calculateEAR(landmarks, leftEye);

        if (ear < blinkThreshold) {
            let now = Date.now();
            if (now - lastBlinkTime > 300) {
                totalBlinkCount++;
                blinkCountThisSecond++;
                lastBlinkTime = now;

                document.getElementById("blinkCount").innerText = totalBlinkCount;
            }
        }
    }
});

// Calculate blink rate every 1 second
setInterval(() => {
    blinkRate = blinkCountThisSecond;
    document.getElementById("blinkRate").innerText = blinkRate;

    updateBlinkLevel(blinkRate);

    blinkCountThisSecond = 0;
}, 1000);


// Blink Level Logic
function updateBlinkLevel(rate) {
    let stressBar = document.getElementById("stressBar");
    let stressText = document.getElementById("stressText");

    let percentage = Math.min(rate * 20, 100); // scale

    stressBar.style.width = percentage + "%";

    if (rate <= 1) {
        stressBar.style.backgroundColor = "lime";
        stressText.innerText = "Low";
    } 
    else if (rate <= 3) {
        stressBar.style.backgroundColor = "orange";
        stressText.innerText = "Medium";
    } 
    else {
        stressBar.style.backgroundColor = "red";
        stressText.innerText = "High";
    }
}


const camera = new Camera(videoElement, {
    onFrame: async () => {
        await faceMesh.send({ image: videoElement });
    },
    width: 640,
    height: 480
});

camera.start();