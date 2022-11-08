import { downloadProgress, uploadProgress } from "./updownload";

export async function retrieveR2File(cid,callback){
  let url = await this.fetch.getSignedR2GetURL({cid});
  let data = await downloadProgress(url, (downloaded)=>{
    callback(downloaded);
  });
  let file = new Blob([data]);
  return file;
}

export async function uploadR2(file, callback){
  let {url, key} = await this.fetch.getSignedR2PutURL({file_name:file.name, file_size: file.size});
  await uploadProgress(url, {}, file, (uploaded)=> {
    callback(uploaded);
  });
  return key;
}