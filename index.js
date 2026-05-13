require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const {
	requireApiKey,
	requireSelfOrAdmin,
} = require("./middleware/auth.middleware");

const usersRouter = require("./routers/user.router");
const aspekRouter = require("./routers/aspek.router");
const raporRouter = require("./routers/rapor.router");
const bestStaffRouter = require("./routers/bestStaff.router");
const jabatanRouter = require("./routers/jabatan.router");
const kementerianRouter = require("./routers/kementerian.router");
const prokerRouter = require("./routers/proker.router");
const kegiatanRouter = require("./routers/kegiatan.router");
const userController = require("./controllers/user.controller");

app.use(cors());
app.use(bodyParser.json());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(requireApiKey);

//route
app.use("/users", usersRouter);
app.use("/aspek", aspekRouter);
app.use("/rapor", raporRouter);
app.use("/proker", prokerRouter);
app.use("/bestStaff", bestStaffRouter);
app.use("/kementerian", kementerianRouter);
app.use("/jabatan", jabatanRouter);
app.use("/kegiatan", kegiatanRouter);
app.use("/is_admin/:nim", requireSelfOrAdmin("nim"), userController.isAdmin);
app.use("*", (_req, res) => res.status(404).json({ error: "Not Found" }));

//server
app.listen(port, () => console.log(`Listening on port ${port}`));
