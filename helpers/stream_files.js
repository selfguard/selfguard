export async function* generateFileBufferSlices(file, first_size, size){
  let cur = 0;
  while (cur < file.size) {
    let whileSize = cur === 0 ? first_size : size;
    let buffer = await file.slice(cur, cur + whileSize).arrayBuffer();
    cur += whileSize;
    yield buffer;
  }
}