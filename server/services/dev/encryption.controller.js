import commonPath from "../../middleware/comman_path/comman.path.js"
const { encrypt, decrypt, commonResponse, responseCode, responseConst,logger } = commonPath

const encryptionController = {
    createEncryption: async (req, res) => {
        if (!req.body) {
            return res.send({ message: "Body required!" })
        }
        const encryptedText = req.body
        try {
            const decryptedText = encrypt(encryptedText);
            return res.send(decryptedText)
        } catch (error) {
            return res
                .status(responseCode.INTERNAL_SERVER_ERROR)
                .json(
                    commonResponse(
                        responseCode.INTERNAL_SERVER_ERROR,
                        responseConst.INTERNAL_SERVER_ERROR,
                        null,
                        true
                    )
                );
        }
    },
    createDecryption: async (req, res) => {
        const encrytedText = req.body.reqBody;
        try {
            const decryptedText = decrypt(encrytedText);
            return res.send({ resBody: decryptedText });
        } catch (error) {
            logger.error(`error --> ${error}`)
            console.log(error)
            return res
                .status(responseCode.INTERNAL_SERVER_ERROR)
                .json(
                    commonResponse(
                        responseCode.INTERNAL_SERVER_ERROR,
                        responseConst.INTERNAL_SERVER_ERROR,
                        null,
                        true
                    )
                );
        }
    }
}
export default encryptionController