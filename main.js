console.log("1. Script loaded.");

let isScanning = true;

const errorLog = document.getElementById("errorCatcher")
const upcFound = document.getElementById('upcFound')
const videoElement = document.getElementById('camera-view')
const docLog = document.getElementById('doclog')
const barcodeDetector = new BarcodeDetector({
})

async function initDetector() {
    if (!('BarcodeDetector' in window)) {
        console.error("BarcodeDetector API is not natively supported in this browser.");
        errorLog.textContent = errorLog.textContent + "Uh Oh! BarcodeDetector API is not natively supported in this browser."
        return;
    }
}

initDetector();


console.log("2. BarcodeDetector initialized.");
docLog.textContent = docLog.textContent + "2. BarcodeDetector initialized."

async function scanByFrame() {
    console.log("5. Running scanByFrame loop...");
    // check if video is in a ready state

    if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {

        const barcodes = await barcodeDetector.detect(videoElement);

        if (barcodes.length > 0) {
            let rawCode = barcodes[0].rawValue;
            console.log("Raw barcode found in frame! (Raw UPC:" + rawCode + ")")
            docLog.textContent = docLog.textContent + "Raw barcode found in frame! (Raw UPC:" + rawCode + ")"

            isScanning = false;

            if (validUPCA(rawCode)) {
                console.log("Verified valid UPC-A:" + rawCode)
                docLog.textContent = docLog.textContent + "Verified valid UPC-A:" + rawCode

                upcFound.textContent = "We found a barcode! " + rawCode

                // Call cloudflare worker (to be created tmmrw.)
            } else if (validEAN13(rawCode)){
                console.log("Verified valid UPC-A:" + rawCode)
                docLog.textContent = docLog.textContent + "Verified valid UPC-A:" + rawCode

                upcFound.textContent = "We found a barcode! " + rawCode

                if (rawCode.length === 13 && rawCode.startsWith('0')) {
                     rawCode = rawCode.substring(1);
                } else {
                    // dont do anything!
                }

                fetch("https://recallscanner.gvinworkmode1031.workers.dev/?upc=" + rawCode)

            } else {
                console.log("Invalid check digit. Resuming scan...");
                docLog.textContent = docLog.textContent + "Invalid check digit. Resuming scan..."
                isScanning = true;
            }

        }

    }

    if (isScanning) {
            requestAnimationFrame(scanByFrame);
        }
}

function validUPCA(rawCode) {


    if (!/^\d{12}$/.test(rawCode)) { // if (not a character from 0-9, checked 12 times), return false.
        return false;
    }

    const digits = rawCode.split('').map(Number);
    const providedCheckDigit = digits[11]; // the 12th digit

    let oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8] + digits[10]; // technically 0 is not even nor odd, but we'll keep it here.

    let multipledOddSum = oddSum * 3

    let evenSum = digits[1] + digits[3] + digits[5] + digits[7] + digits[9];

    let totalSum = multipledOddSum + evenSum;

    let remainder = totalSum % 10;
    let calculatedCheckDigit = remainder === 0 ? 0 : 10 - remainder;

    return calculatedCheckDigit === providedCheckDigit;


}

function validEAN13(rawCode) {


    if (!/^\d{13}$/.test(rawCode)) { // if (not a character from 0-9, checked 12 times), return false.
        return false;
    }

    const digits = rawCode.split('').map(Number);
    const providedCheckDigit = digits[12]; // the 13th digit - EAN_13

    let oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8] + digits[10] // technically 0 is not even nor odd, but we'll keep it here.

    let evenSum = digits[1] + digits[3] + digits[5] + digits[7] + digits[9] + digits[11];

    let totalSum = oddSum + (evenSum * 3);

    let remainder = totalSum % 10;
    let calculatedCheckDigit = remainder === 0 ? 0 : 10 - remainder;

    return calculatedCheckDigit === providedCheckDigit;


}


scanByFrame();
