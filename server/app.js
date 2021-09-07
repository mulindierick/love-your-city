import express, { json } from "express";
import UserRoutes from "./routes/users.js";
const app = express();

app.use(json());
app.use("/users", UserRoutes);

let PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`server has started on http://localhost:${PORT}`)
);
