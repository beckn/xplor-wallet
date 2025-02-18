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
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
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
      height: 80vh; /* 80% of viewport height */
      display: block;
      margin: auto;
      img{
        width:100%;
      }
  }

  .download-button {
      margin-top: 10px;
      display: none;
      background-color: blue;
      width: 160px;
      font-family: poppins;
      text-decoration: none;
      font-weight: 600;
      padding: 12px 12px 12px 12px;
      border-radius: 12px;
      color: white;
  }
  
  .download-button:hover {
      transition: 250ms;
        background-color: black;
        color: white;
  }

  @media only screen and (max-width: 768px) {
      /* Show the button only on devices with a maximum width of 768px (typical tablets and phones) */
      .download-button {
          display: block;
      }

       img,
  object {
      width: 80vw; /* 80% of viewport width */
      height: 80vh; /* 80% of viewport height */
      display: block;
      margin: auto;
      img{
        width:100%;
      }
  }
</style>
</head>
<body>
  <div class="overlay"></div>
  <div class="content">
    <div class="card">
      <h2>vc-name</h2><html lang="en">
      <object
          type=""
          data="remote-url"
          style="width: 100%; height: auto"
        ></object>
      <a href="#" class="download-button">Download</a>
    </div>
  </div>
</body>

<script>

    // function to Load image
    document.addEventListener("DOMContentLoaded", function () {
        function applyImageStylesForMobile() {
            if (window.innerWidth <= 768) { // Adjust breakpoint for mobile view
                document.querySelectorAll("img").forEach(img => {
                    img.style.maxWidth = "100%";
                    img.style.height = "auto";
                    img.style.borderRadius = "10px"; // Example styling
                });
            }
        }

        applyImageStylesForMobile();
        window.addEventListener("resize", applyImageStylesForMobile);
    });
   
    // Function to trigger the file download
    function downloadFile(url) {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'certificate.pdf'; // Change the filename if needed
      anchor.click();
    }

    // Document listener for the download button
    document.querySelector('.download-button').addEventListener('click', function(event) {
      event.preventDefault(); // Prevent default anchor behavior
      const fileUrl = 'remote-url';
      downloadFile(fileUrl);
    });
</script>
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
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
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
      height: 80vh; /* 80% of viewport height */
      display: block;
      margin: auto;

      img{
       width:100%;
      }
  }

  .download-button {
      margin-top: 10px;
      display: none;
      background-color: blue;
      width: 160px;
      font-family: poppins;
      text-decoration: none;
      font-weight: 600;
      padding: 12px 12px 12px 12px;
      border-radius: 12px;
      color: white;
  }
  
  .download-button:hover {
      transition: 250ms;
        background-color: black;
        color: white;
  }

  @media only screen and (max-width: 768px) {
      /* Show the button only on devices with a maximum width of 768px (typical tablets and phones) */
      .download-button {
          display: block;
      }
  }
</style>
</head>
<body>
  <div class="overlay"></div>
  <div class="content">
    <div class="card">
      <h2>vc-name</h2>
      <object id="fileObject"></object>
      <a href="#" class="download-button">Download</a>
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

    // Add event listener to download button
    document.querySelector('.download-button').addEventListener('click', async () => {
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
            const blobUrl = URL.createObjectURL(data); // Create blob URL for the blob
            const a = document.createElement('a'); // Create a link element
            a.href = blobUrl; // Set the href attribute to the blob URL
            a.download = 'certificate.pdf'; // Set the download attribute with desired file name
            a.click(); // Simulate click event to trigger download
        } catch (error) {
            console.error('Error:', error);
        }
    });
  </script>
</body>
</html>
`
