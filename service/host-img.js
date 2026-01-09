/**
 * ImgBB API documentation: https://publicapi.dev/imgbb-api
 * Upload-Image endpoint:
 *  [*] POST https://api.imgbb.com/1/upload
 *  [*] Body: 
 *      [+] key: API key
 *      [+] image: upload image file
 *      [+] name (optional): image filename
 * Example: 
 * {
 *    "key": "your_api_key",
 *    "image": "base64_encoded_image_data",
 *    "name": "example_image.jpg"
 * }
 * ======================================================== 
 * Get-Image endpoint:
 *  [*] GET https://api.imgbb.com/1/image/:image_id
 *  [*] Parameters:
 *      [+] key: API key
 *      [+] image_id: uploaded image id
 * Example: 
 * GET https://api.imgbb.com/1/image/image_id?key=api_key
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function hostImageBase64(base64String) {
  // 1. Remove the "data:image/jpeg;base64," prefix
  // ImgBB wants just the raw data
  const cleanBase64 = base64String.replace(/^data:image\/\w+;base64,/, "");

  const fd = new FormData();
  fd.append('key', process.env.IMGBB_API_KEY);
  // ImgBB automatically detects base64 if pass it in the 'image' field
  fd.append('image', cleanBase64); 

  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.imgbb.com/1/upload',
      data: fd,
      headers: fd.getHeaders() // Important for axios + form-data in Node
    });
    return response.data; // Return the ImgBB data object
  } catch (error) {
    console.error("ImgBB Error:", error.response ? error.response.data : error.message);
    throw error;
  }
}

async function hostImage(filePath) {
  const fd = new FormData();
  fd.append('key', process.env.IMGBB_API_KEY);
  fd.append('image', fs.createReadStream(filePath));

  try {
    var response = await axios({
      method: 'post',
      url: 'https://api.imgbb.com/1/upload',
      data: fd
    });
    return response;
  } catch (error) {
    return `Error imgBB request: ${error.response ? error.response.data : error.message}`;   
  }
}

module.exports = { hostImageBase64, hostImage };
