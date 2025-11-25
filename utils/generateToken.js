import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config();

export default function GenerateToken(user) {
    const token = jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
    return token;
}