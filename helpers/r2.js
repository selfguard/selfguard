import axios from "axios";

export async function retrieveR2File(cid, type){

  let url = await this.fetch.getSignedR2GetURL({cid});

  axios.defaults.headers.common = {
    // "X-API-Key": this.api_key
  };
  let res = await axios.get(
    url,
    {
      headers: {
        Accept: type,
      },
      responseType: "blob",
    }
  );
  let file = new Blob([res.data]);
  return file;
}

async function upload(url, file, callback) {
  return new Promise((resolve,reject)=> {
    const config = {
      onUploadProgress: function(progressEvent) {
        var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        console.log(percentCompleted)
        callback(percentCompleted)
      }
    }
    axios.defaults.headers.common = {
      // "X-API-Key": this.api_key
    };
    axios.put(url, file, config)
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

export async function uploadR2(file, size_so_far, totalSize, callback){
  let {url, key} = await this.fetch.getSignedR2PutURL({file_name:file.name, file_size: file.size});
  await upload(url, file, callback);
  callback(null,100);
  return key;
}