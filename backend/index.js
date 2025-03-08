import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend fungerar!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servern körs på port ${PORT}`));
