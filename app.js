import express, { json } from "express";
import loginRoutes from "./routes/login.js";
import UserRoutes from "./routes/users.js";

const app = express();

app.use(json());

app.get("/", (req, res) => {
  res.redirect("/users");
});
app.use("/users", UserRoutes);
app.use("/login", loginRoutes);

let PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`server has started on http://localhost:${PORT}`)
);
