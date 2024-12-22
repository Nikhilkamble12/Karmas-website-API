import crypto from "crypto";

function encrypt(text) {
  try{
  // Initialize an Initialization Vector (IV) from environment variable as a hexadecimal buffer
  const IV = Buffer.from(process.env.ENCRYPTION_IV, "hex");
  // Check IV length
  if (IV.length !== 16) {
    throw new Error(
      "Invalid IV length. It should be 16 bytes (32 hex characters)."
    );
  }

  // Create a cipher object for AES-256-CBC encryption
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(process.env.ENCRYPTION_SECRET_KEY, "hex"),
    IV
  );

  // Convert non-string data types to string representation (assumes input is in JSON format)
  const plaintext = JSON.stringify(text);

  // Perform encryption and store the result in 'encrypted' variable as hexadecimal
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Return the encrypted data along with the IV as an object
  return { resBody: IV.toString("hex") + encrypted };
}catch(error){
  console.log("error",error)
}
}

export default encrypt;
