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
  const apiURL = "https://script.google.com/macros/s/AKfycbxl2Fopw-HBNssw2265SPcxFPugv91YuV2R0eqoooqxxxzLCBsNBuaIHmEYUX1a3oRMrQ/exec";

  fetch(`${apiURL}?barcode=${barcode}`)
    .then((response) => response.json())
    .then((data) => {
      const transaction = data.transactions.find((t) => t.ID == barcode);
      const resultCard = document.getElementById("result-card");
      resultCard.innerHTML = "";
      if (transaction) {
        const userDetails = data.users.find(user => user.Roll === transaction.IssueBy);
        let contentHTML = `<h3>Barcode: ${barcode}</h3><p><b>Book Name</b>: ${transaction.BookName}</p>`;

        contentHTML += `
          <div>
            <label for="roll-input">Roll Number (Required):</label>
            <input type="number" id="roll-input" name="roll-input" value="${userDetails ? userDetails.Roll : ''}" required>
          </div>
          <div>
            <label for="issue-date">Issue Date (Required):</label>
            <input type="date" id="issue-date" name="issue-date" value="${transaction.IssueDate ? new Date(transaction.IssueDate).toISOString().split('T')[0] : ''}" required>
            <label for="due-date">Due Date (Required):</label>
            <input type="date" id="due-date" name="due-date" value="${transaction.DueDate ? new Date(transaction.DueDate).toISOString().split('T')[0] : ''}" required>
          </div>
          <button onclick="updateTransactionDetails(${barcode})">Update Details</button>
        `;

        resultCard.innerHTML = contentHTML;
        resultCard.style.display = "block";
      } else {
        barcodeResultElement.textContent = "No transaction found for this barcode.";
      }
    })
    .catch((error) => {
      console.error("Error fetching the API data:", error);
      barcodeResultElement.textContent = "Error fetching data.";
    });
}


function updateTransactionDetails(barcode) {
  const roll = document.getElementById('roll-input').value;
  const issueDate = document.getElementById('issue-date').value;
  const dueDate = document.getElementById('due-date').value;
  
  fetch(`${apiURL}?barcode=${barcode}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ roll, issueDate, dueDate }),
  })
  .then(response => response.json())
  .then(data => {
    alert('Transaction details updated successfully!');
    sendBarcodeData(barcode); // Refresh the data on UI
  })
  .catch(error => console.error('Failed to update transaction details', error));
}
// function sendBarcodeData(barcode) {
//   const apiURL = "https://script.google.com/macros/s/AKfycbxl2Fopw-HBNssw2265SPcxFPugv91YuV2R0eqoooqxxxzLCBsNBuaIHmEYUX1a3oRMrQ/exec";

//   fetch(`${apiURL}?barcode=${barcode}`)
//     .then((response) => response.json())
//     .then((data) => {
//       const transaction = data.transactions.find((t) => t.ID == barcode);
//       const resultCard = document.getElementById("result-card");
//       resultCard.innerHTML = "";
//       if (transaction) {
//         const userDetails = data.users.find(user => user.Roll === transaction.IssueBy);
//         resultCard.innerHTML = `
//           <h3>Barcode : ${barcode}</h3>
//           <p><b>Book Name</b> : ${transaction.BookName}</p>
//           <p><b>Issued By</b> : ${userDetails ? userDetails.Name : "Unknown"}</p>
//           <p><b>Issue Date</b> : ${new Date(transaction.IssueDate).toLocaleDateString()}</p>
//           <p><b>Due Date</b> : ${new Date(transaction.DueDate).toLocaleDateString()}</p>
//         `;
//         resultCard.style.display = "block";
//       } else {
//         barcodeResultElement.textContent = "No transaction found for this barcode.";
//       }
//     })
//     .catch((error) => {
//       console.error("Error fetching the API data:", error);
//       barcodeResultElement.textContent = "Error fetching data.";
//     });
// }

// function sendBarcodeData(barcode) {
//   const apiURL = "https://script.google.com/macros/s/AKfycbxl2Fopw-HBNssw2265SPcxFPugv91YuV2R0eqoooqxxxzLCBsNBuaIHmEYUX1a3oRMrQ/exec";

//   fetch(`${apiURL}?barcode=${barcode}`)
//     .then((response) => response.json())
//     .then((data) => {
//       const transaction = data.transactions.find((t) => t.ID == barcode);
//       const resultCard = document.getElementById("result-card");
//       resultCard.innerHTML = "";
//       if (transaction) {
//         const userDetails = data.users.find(user => user.Roll === transaction.IssueBy);
//         let contentHTML = `
//           <h3>Barcode: ${barcode}</h3>
//           <p><b>Book Name</b>: ${transaction.BookName}</p>
//         `;

//         if (!userDetails) {
//           contentHTML += `
//             <div>
//               <label for="roll-input">Enter Roll:</label>
//               <input type="number" id="roll-input" name="roll-input" required>
//               <button onclick="updateRoll(${barcode})">Update Roll</button>
//             </div>
//           `;
//         } else {
//           contentHTML += `<p><b>Issued By</b>: ${userDetails.Name} (Roll: ${userDetails.Roll})</p>`;
//         }

//         // Check if dates are empty and provide input fields if they are
//         if (!transaction.IssueDate || !transaction.DueDate) {
//           contentHTML += `
//             <div>
//               <label for="issue-date">Issue Date:</label>
//               <input type="date" id="issue-date" name="issue-date" ${transaction.IssueDate ? `value="${new Date(transaction.IssueDate).toISOString().split('T')[0]}"` : ''} required>
//               <label for="due-date">Due Date:</label>
//               <input type="date" id="due-date" name="due-date" ${transaction.DueDate ? `value="${new Date(transaction.DueDate).toISOString().split('T')[0]}"` : ''} required>
//               <button onclick="updateDates(${barcode})">Update Dates</button>
//             </div>
//           `;
//         } else {
//           contentHTML += `
//             <p><b>Issue Date</b>: ${new Date(transaction.IssueDate).toLocaleDateString()}</p>
//             <p><b>Due Date</b>: ${new Date(transaction.DueDate).toLocaleDateString()}</p>
//           `;
//         }

//         resultCard.innerHTML = contentHTML;
//         resultCard.style.display = "block";
//       } else {
//         barcodeResultElement.textContent = "No transaction found for this barcode.";
//       }
//     })
//     .catch((error) => {
//       console.error("Error fetching the API data:", error);
//       barcodeResultElement.textContent = "Error fetching data.";
//     });
// }


// function updateDates(barcode) {
//   const issueDate = document.getElementById("issue-date").value;
//   const dueDate = document.getElementById("due-date").value;

//   // Assuming your API supports POST requests to update data
//   fetch(`${apiURL}?barcode=${barcode}`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ issueDate, dueDate }),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       alert("Dates updated successfully!");
//       sendBarcodeData(barcode); // Refresh the data on UI
//     })
//     .catch((error) => console.error("Failed to update dates", error));
// }

// function updateRoll(barcode) {
//   const roll = document.getElementById('roll-input').value;
  
//   // Assuming your API supports POST requests to update data
//   fetch(`${apiURL}?barcode=${barcode}`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ roll }),
//   })
//   .then(response => response.json())
//   .then(data => {
//     alert('Roll updated successfully!');
//     sendBarcodeData(barcode); // Refresh the data on UI
//   })
//   .catch(error => console.error('Failed to update roll', error));
// }


// function sendBarcodeData(barcode) {
//   const apiURL = "https://script.google.com/macros/s/AKfycbxl2Fopw-HBNssw2265SPcxFPugv91YuV2R0eqoooqxxxzLCBsNBuaIHmEYUX1a3oRMrQ/exec";

//   fetch(`${apiURL}?barcode=${barcode}`)
//     .then((response) => response.json())
//     .then((data) => {
//       const transaction = data.transactions.find(t => t.ID == barcode);
//       const resultTable = document.getElementById("result-table");
//       const tbody = resultTable.getElementsByTagName("tbody")[0];

//       // Clear previous results
//       tbody.innerHTML = '';

//       if (transaction) {
//         const userDetails = data.users.find(user => user.Roll === transaction.IssueBy);

//         // Adding rows for each detail
//         const fields = [
//           { label: 'Barcode', value: barcode },
//           { label: 'Issued By', value: userDetails ? userDetails.Name : "Unknown" },
//           { label: 'Book Name', value: transaction.BookName },
//           { label: 'Issue Date', value: new Date(transaction.IssueDate).toLocaleDateString() },
//           { label: 'Due Date', value: new Date(transaction.DueDate).toLocaleDateString() }
//         ];

//         fields.forEach(field => {
//           const row = tbody.insertRow();
//           const cellLabel = row.insertCell();
//           const cellValue = row.insertCell();
//           cellLabel.textContent = field.label;
//           cellValue.textContent = field.value;
//         });

//         // Show the result table
//         resultTable.style.display = 'table';
//       } else {
//         document.getElementById("barcode-result").textContent = "No transaction found for this barcode.";
//       }
//     })
//     .catch((error) => {
//       console.error("Error fetching the API data:", error);
//       document.getElementById("barcode-result").textContent = "Error fetching data.";
//     });
// }

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
