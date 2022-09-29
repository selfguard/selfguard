export async function* generateFileBufferSlices(file, size){
  let cur = 0;
  while (cur < file.size) {
    let buffer = await file.slice(cur, cur + size).arrayBuffer();
    cur += size;
    yield buffer;
  }
}