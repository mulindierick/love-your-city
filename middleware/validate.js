import jwt from "jsonwebtoken";

function validToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) return res.json({ msg: "null token" });
  jwt.verify(token, process.env.ACCESS_TOKEN, (error, user) => {
    if (error) return res.json({ error: error.message });
    req.user = user;
    next();
  });
}

export { validToken };
