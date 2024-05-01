const videoElement = document.getElementById("scanner");
const barcodeResultElement = document.getElementById("barcode-result");
const libraryLogo = document.getElementById("library-logo"); // Get the logo element
let selectedDeviceId;
const codeReader = new ZXing.BrowserMultiFormatReader();
let videoStream; // A variable to keep track of the video stream

window.addEventListener("load", () => {
  codeReader
    .listVideoInputDevices()
    .then((videoInputDevices) => {
      if (videoInputDevices.length > 0) {
        selectedDeviceId = videoInputDevices[0].deviceId;
        startScanning(selectedDeviceId);
      } else {
        console.error("No video devices found.");
        barcodeResultElement.textContent = "No video devices found.";
      }
    })
    .catch((err) => {
      console.error(err);
      barcodeResultElement.textContent = "Error accessing video devices.";
    });
});

function startScanning(deviceId) {
  codeReader
    .decodeFromVideoDevice(deviceId, "scanner", (result, err) => {
      if (result) {
        console.log(result.text);
        barcodeResultElement.textContent = "Barcode Detected"; // Display a success message
        sendBarcodeData(result.text); // Call your function with the scanned barcode
        stopScanning(); // Stop the scanning and hide the video element
      } else if (err && !(err instanceof ZXing.NotFoundException)) {
        console.error(err);
      }
    })
    .then((stream) => {
      videoStream = stream; // Keep track of the stream to stop it later
    });
}

function stopScanning() {
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop()); // Stop each track of the stream
  }
  videoElement.style.display = "none"; // Hide the video element
}

libraryLogo.addEventListener("click", () => {
  videoElement.style.display = "block"; // Show the video element again
  startScanning(selectedDeviceId); // Restart the scanning process
  window.location.reload(); // Refresh the page
});
function sendBarcodeData(barcode) {
  const apiURL =
    "https://script.google.com/macros/s/AKfycbxl2Fopw-HBNssw2265SPcxFPugv91YuV2R0eqoooqxxxzLCBsNBuaIHmEYUX1a3oRMrQ/exec";

  fetch(`${apiURL}?barcode=${barcode}`)
    .then((response) => response.json())
    .then((data) => {
      const transaction = data.transactions.find((t) => t.ID == barcode);
      const resultCard = document.getElementById("result-card");
      resultCard.innerHTML = "";
      if (transaction) {
        if (transaction.IssueBy) {
          const userDetails = data.users.find(
            (user) => user.Roll === transaction.IssueBy
          );
          resultCard.innerHTML = `
            <h3>Barcode : ${barcode}</h3>
            <p><b>Book Name</b> : ${transaction.BookName}</p>
            <p><b>Issued By</b> : ${
              userDetails ? userDetails.Name : "Unknown"
            } (Roll: ${userDetails ? userDetails.Roll : "N/A"})</p>
            <p><b>Issue Date</b> : ${new Date(
              transaction.IssueDate
            ).toLocaleDateString()}</p>
            <p><b>Due Date</b> : ${new Date(
              transaction.DueDate
            ).toLocaleDateString()}</p>
          `;
        } else {
          resultCard.innerHTML = `
            <h3>Barcode : ${barcode}</h3>
            <p><b>Book Name</b> : ${transaction.BookName}</p>
            <button onclick="issueBook('${barcode}')">Issue Book</button>
          `;
        }
        resultCard.style.display = "block";
      } else {
        barcodeResultElement.textContent =
          "No transaction found for this barcode.";
      }
    })
    .catch((error) => {
      console.error("Error fetching the API data:", error);
      barcodeResultElement.textContent = "Error fetching data.";
    });
}
function issueBook(barcode) {

  const rollNumber = prompt("Please enter your Roll Number:");
  if (!rollNumber) {
    alert("Roll Number is required to issue a book.");
    return;
  }
  console.log("Issue book with barcode:", barcode);

  const currentDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(currentDate.getDate() + 15);

  const issueData = {
    barcode: barcode,
    issueBy: rollNumber,
    issueDate: currentDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
    dueDate: dueDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
  };

  fetch("https://script.google.com/macros/s/AKfycbxl2Fopw-HBNssw2265SPcxFPugv91YuV2R0eqoooqxxxzLCBsNBuaIHmEYUX1a3oRMrQ/exec", {
    method: "POST",
    contentType: "application/json",
    body: JSON.stringify(issueData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Book issued successfully:", data);
      alert("Book issued successfully.");
      // Refresh or update UI as needed
    })
    .catch((error) => console.error("Error issuing book:", error));
}