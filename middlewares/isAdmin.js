export default function isAdmin(req, res, next) {
    try {
        if(req.user && (req.user.role === 1 )) {
            next();
        }else{
            res.status(401).json({message: "You are not authorized to access this route"})
        }
    }catch(error) {
        next(error);
    }
}