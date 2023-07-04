const express = require("express");
const app = express();
const axios = require("axios");
const mongoose = require("mongoose");
const { connection } = require("./Config/Db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 3000;

const SECRET_KEY = process.env.SECRET_KEY;

// Define the User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

app.use(express.json());
app.use(express.static("public"));

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = process.env.OPENAI_API_URL;
// User registration
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email }, SECRET_KEY);

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = decoded;
    next();
  });
};
app.use(verifyToken);
app.get("/generate", async (req, res) => {
  const jokeType = req.query.jokeType;
  const joke = await generateJoke(jokeType);
  res.json({ joke });
});

async function generateJoke(jokeType) {
  const prompt = `Generate a ${jokeType} joke:`;
  try {
    const response = await axios
      .post(
        OPENAI_API_URL,
        // {
        //     prompt,
        //     max_tokens: 50,
        //     // Set the desired maximum length of the generated joke
        //     temperature: 0.7,
        //     // Adjust the temperature for more or less random output
        //     n: 1,
        //     // Generate a single completion
        // },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => console.log(res))
      .catch((error) => console.log(error));

    const joke = response.data.choices[0].text.trim();
    return joke;
  } catch (error) {
    console.error("Error generating joke:", error);
    throw new Error("An error occurred while generating the joke");
  }
}

app.listen(PORT, async () => {
  await connection;
  console.log(`Server running on port ${PORT}`);
});
