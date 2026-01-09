const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function requestImagga(imageInput) {
  console.log("Enter requestImagga function");
  console.log("Image INPUT:", imageInput);
  const url = 'https://api.imagga.com';
  const APIs = {
    "img-tag": "/v2/tags",
    "category": "/v2/categorizers/general_v3",
    "face-detect": "/v2/faces/detections",
    "text-recog": "/v2/text",
  };
  
  const apiOption = APIs['category']; 
  
  // Basic headers (Authorization only)
  const baseHeaders = {
    'Authorization': process.env.IMAGGA_HEADER
  };


  try {
    // --- CASE 1: Public URL (ImgBB) ---
    // GET instead of POST request
    console.log("Image Input:", imageInput);
    
    if (imageInput.startsWith('http')) {
      console.log("Processing Public URL:", imageInput);

      const resp = await axios.get(`${url}${apiOption}`, {
        params: { image_url: imageInput }, // Query param ?image_url=...
        headers: baseHeaders
      });
      return resp.data;
    }

    // --- CASE 2 & 3: File Upload or Base64 (Requires POST + FormData) ---
    const fd = new FormData();

    if (imageInput.startsWith('data:image')) {
      console.log("Processing Base64 image...");
      // Remove header and create Buffer
      const base64Data = imageInput.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      // Append Buffer (Must provide filename)
      fd.append('image', buffer, 'upload.jpg');

    } else {
      console.log("Processing File Path:", imageInput);
      if (fs.existsSync(imageInput)) {
        fd.append('image', fs.createReadStream(imageInput));
      } else {
        return `Error: File not found at ${imageInput}`;
      }
    }

    // Combine Auth headers with Multipart headers
    const multipartHeaders = {
      ...baseHeaders,
      ...fd.getHeaders()
    };

    console.log("Sending Upload to Imagga...");
    const resp = await axios.post(`${url}${apiOption}`, fd, { headers: multipartHeaders });
    return resp.data;

  } catch (error) {
    const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.log(`Imagga API Error: ${errorMsg}`);
    return `Error requesting Imagga: ${errorMsg}`;
  }
}

module.exports = { requestImagga };