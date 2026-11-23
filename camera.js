    // Video settings

    let vidsettings = {
        video: {
            facingMode: "environment", // user (front camera/ primary camera), environment (back camera/ secondary camera)
        },

        audio: false // turns off audio, a scanner doesn't need audio!
    }

async function startCamera() {
    const videoElement = document.getElementById('camera-view');
    const videoErrorLog = document.getElementById('errorCatcher');
    const errorTip = document.getElementById('errorTip');

    try {
        const stream = await navigator.mediaDevices.getUserMedia(vidsettings);

        videoElement.srcObject = stream;

        videoElement.setAttribute('playsinline', true);
        await videoElement.play();
    } catch (error) {
        videoErrorLog.textContent = errorLog.textContent + "Uh oh! There was an unexpected error! Error: " + error;
        errorTip.textContent = "If you don't see your camera, there may be an issue with your permissions. If you do, ignore this message!"
    }
}

async function flip() {
    
    if (vidsettings.video.facingMode === "environment") {
        // flip to user
        vidsettings.video.facingMode = "user"
    } else {
        // flip to environment
        vidsettings.video.facingMode = "environment"
    }

    await startCamera();
}