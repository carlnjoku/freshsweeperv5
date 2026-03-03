import { getDownloadURL, ref, uploadBytesResumable, uploadBytes } from 'firebase/storage';
import { storage } from './config';


const uploadFile = async(file, filePath) => {
    console.log(file)
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function(e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', file, true);
      xhr.send(null);
    });

  
    const fileRef = ref(storage, filePath);
    const result = await uploadBytes(fileRef, blob);

    // We're done with the blob, close and release it
    blob.close();

    return await getDownloadURL(fileRef);
   
   
  }
 

export default uploadFile;