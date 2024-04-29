const videoElement = document.getElementById("scanner");
const resultElement = document.getElementById("result"); // Get the result display element
let selectedDeviceId;
const codeReader = new ZXing.BrowserMultiFormatReader();

window.addEventListener("load", () => {
  codeReader
    .listVideoInputDevices()
    .then((videoInputDevices) => {
      if (videoInputDevices.length > 0) {
        selectedDeviceId = videoInputDevices[0].deviceId;
        startScanning(selectedDeviceId);
      } else {
        console.error("No video devices found.");
        resultElement.textContent = "No video devices found."; // Display error message
      }
    })
    .catch((err) => {
      console.error(err);
      resultElement.textContent = "Error accessing video devices."; // Display error message
    });
});

// function startScanning(deviceId) {
//     codeReader.decodeFromVideoDevice(deviceId, 'scanner', (result, err) => {
//         if (result) {
//             console.log(result.text);
//             resultElement.textContent = 'Barcode found: ' + result.text; // Display the scanned result
//             codeReader.reset();  // Optionally reset the scanner depending on your application's needs
//         } else if (err && !(err instanceof ZXing.NotFoundException)) {
//             console.error(err);
//         }
//     });
// }

function startScanning(deviceId) {
  codeReader.decodeFromVideoDevice(deviceId, "scanner", (result, err) => {
    if (result) {
      console.log(result.text);
      sendBarcodeData(result.text); // Call your function with the scanned barcode
      codeReader.reset(); // Optionally reset the scanner
    } else if (err && !(err instanceof ZXing.NotFoundException)) {
      console.error(err);
    }
  });
}

function sendBarcodeData(barcode) {
  const apiURL =
    "https://script.google.com/macros/s/AKfycbxl2Fopw-HBNssw2265SPcxFPugv91YuV2R0eqoooqxxxzLCBsNBuaIHmEYUX1a3oRMrQ/exec";

  fetch(`${apiURL}?barcode=${barcode}`) // Assume barcode is needed as a query parameter
    .then((response) => response.json())
    .then((data) => {
      // Assuming data contains a list of transactions
      //       const transaction = data.transactions.find((t) => t.ID === barcode);
      const transaction = data.transactions.find(
        (transaction) => transaction.ID == barcode
      );
      document.getElementById("barcode-result").textContent =
        "Detected Barcode: " + barcode;

      if (transaction) {
        const userDetails = data.users.find(
          (user) => user.Roll === transaction.IssueBy
        );
        document.getElementById(
          "barcode-result"
        ).textContent += ` | Details: Book Name: ${
          transaction.BookName
        }, Issued By: ${userDetails.Name}, Issue Date: ${new Date(
          transaction.IssueDate
        ).toLocaleDateString()}, Due Date: ${new Date(
          transaction.DueDate
        ).toLocaleDateString()}`;
      } else {
        document.getElementById("barcode-result").textContent +=
          " | No transaction found for this barcode.";
      }
    })
    .catch((error) => {
      console.error("Error fetching the API data:", error);
      document.getElementById("barcode-result").textContent =
        "Detected Barcode: " + barcode + " | Error fetching data.";
    });
}
