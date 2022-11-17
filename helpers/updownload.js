import axios from "axios";

/**
 * It downloads a file from a given url, and returns a promise that resolves to the file's data
 * @param url - The url of the file you want to download
 * @param callback - This is the function that will be called every time the download progress changes.
 * @returns A promise that resolves to the data of the response.
 */
export const downloadProgress = (url, callback) => {
  return new Promise((resolve,reject)=>{
    axios.defaults.headers.common = {
    };
    axios.get(url, {
      headers: {
        Accept: '*',
      },
      responseType: "blob",
      onDownloadProgress: progressEvent => {
        console.log({progressEvent});
        callback(progressEvent.loaded);
      }
    })
    .then(res => {
      resolve(res.data);
    })
    .catch(err => {
      reject(err);
    })
  })
}

export const uploadProgress = (url, headers, file, callback) => {
  return new Promise((resolve,reject)=> {
    const config = {
      onUploadProgress: function(progressEvent) {
        callback(progressEvent.loaded)
      }
    }
    axios.defaults.headers.common = headers;
    axios.post(url, file, config)
      .then(res => {
        console.log(res)
        resolve(res);
      })
      .catch(err => {
        console.log(err)
        reject(err);
      })
  });
}




