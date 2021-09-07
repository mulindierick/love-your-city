import express from "express";
import UserRoutes from "./routes/users.js";
const app = express();

app.use("/user", UserRoutes);

let PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`server has started on http://localhost:${PORT}`))


