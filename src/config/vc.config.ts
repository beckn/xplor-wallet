export const VC_SELF_ISSUED_VIEW_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <title>Xplor - View File</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: 'Poppins', sans-serif;
      background-color: rgba(255, 255, 255, 0.8); /* White background with 80% opacity */
    }
    .card {
      width: 80%;
      height: 80%;
      background-color: white;
      border-radius: 10px;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); /* Soft shadow effect */
      padding: 20px;
      text-align: center;
      z-index: 1; /* Ensure the card stays below the overlay */
    }
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5); /* Transparent black overlay */
      z-index: 2; /* Overlay should be above the card */
    }
    .content {
      position: relative;
      z-index: 3; /* Ensure content is above the overlay */
      width: 100%;
      display: flex;
      justify-content: center;
    }
    h2 {
      font-weight: 600;
    }
    img, object {
      max-width: 100%;
      height: 80vh;
      display: block;
      margin: auto;
    }
  </style>
</head>
<body>
  <div class="overlay"></div>
  <div class="content">
    <div class="card">
      <h2>vc-name</h2>
      <object data="remote-url"></object>
    </div>
  </div>
</body>
</html>
`

export const VC_RECEIVED_VIEW_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <title>Xplor - View File</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: 'Poppins', sans-serif;
      background-color: rgba(255, 255, 255, 0.8); /* White background with 80% opacity */
    }
    .card {
      width: 80%;
      height: 80%;
      background-color: white;
      border-radius: 10px;
      box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); /* Soft shadow effect */
      padding: 20px;
      text-align: center;
      z-index: 1; /* Ensure the card stays below the overlay */
    }
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5); /* Transparent black overlay */
      z-index: 2; /* Overlay should be above the card */
    }
    .content {
      position: relative;
      z-index: 3; /* Ensure content is above the overlay */
      width: 100%;
      display: flex;
      justify-content: center;
    }
    h2 {
      font-weight: 600;
    }
    img,
        object {
            width: 80vw; /* 80% of viewport width */
            height: 80vh;
            display: block;
            margin: auto;
        }
  </style>
</head>
<body>
  <div class="overlay"></div>
  <div class="content">
    <div class="card">
      <h2>vc-name</h2>
      <object id="fileObject"></object>
    </div>
  </div>

  <script>
    // Fetch data using JavaScript
    async function fetchData() {
      const url = 'remote-url'; // Specify your API endpoint URL
      const headers = {
        'templateId': 'template-id-here', // Example custom header
        'Accept': 'application/pdf'
      };

      try {
        const response = await fetch(url, {
          headers: headers
        });

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.blob(); // Get response body as blob
        const objectUrl = URL.createObjectURL(data); // Create object URL for the blob
        const fileObject = document.getElementById('fileObject');
        fileObject.setAttribute('data', objectUrl); // Set object URL as data attribute
      } catch (error) {
        console.error('Error:', error);
      }
    }

    // Call fetchData function to fetch data when the page loads
    fetchData();
  </script>
</body>
</html>
`
