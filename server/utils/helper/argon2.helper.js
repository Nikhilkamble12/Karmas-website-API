//----- Hash encrypt -----

import argon2 from 'argon2';

const argon2Verify=async(newData,oldData)=>{
  let comparePassword = await argon2.verify(oldData, newData);
  return comparePassword
}
const hashArgon=async(data)=>{
  let  encryptedData = await argon2.hash(data);
  return encryptedData
}
export default {argon2Verify,hashArgon}
