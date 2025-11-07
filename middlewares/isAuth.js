import jwt from "jsonwebtoken"

const secret_key = process.env.JWT_SECRET;

export default function isAuth(req, res, next) {
    try{
        const authorization = req.headers.authorization ? req.headers.authorization.split(" ") : [];
        const token = authorization.length > 1 ? authorization[1] : null;

        if(token) {
            const payload = jwt.verify(token, secret_key);

            if(payload) {
                req.user = {
                    id: payload.id,
                    name: payload.name,
                    email: payload.email,
                    role: payload.role
                };
                next();
            }
        }
    }catch(error) {
        next(error);
    }
}