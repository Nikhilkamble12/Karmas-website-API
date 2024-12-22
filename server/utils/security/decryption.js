import crypto from "crypto";

// Function to decrypt an encrypted text
function decrypt(encryptedText) {
  // Define the length of the Initialization Vector (IV) for AES encryption
  const IV_LENGTH = 16;

  // Extract the IV (Initialization Vector) from the encrypted text
  const IV = Buffer.from(encryptedText.substr(0, IV_LENGTH * 2), "hex");

  // Extract the actual encrypted data from the input
  const encryptedData = encryptedText.substr(IV_LENGTH * 2);

  // Create a decipher object for AES-256-CBC decryption
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc", // AES-256-CBC algorithm
    Buffer.from(process.env.ENCRYPTION_SECRET_KEY, "hex"), // Secret key for decryption
    IV // Initialization Vector used during encryption
  );

  // Perform decryption and store the result in 'decrypted' variable
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  // Parse the decrypted data (assumed to be in JSON format) and return it
  return JSON.parse(decrypted);
}

// Export the 'decrypt' function to make it accessible to other modules
export default decrypt;