//----- Intialize JWT token -----
import dotenv from 'dotenv';
dotenv.config();
export const secret = process.env.JWT_SECRET;
