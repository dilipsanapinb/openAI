const jokeForm = document.getElementById("joke-form");
const jokeTypeSelect = document.getElementById("joke-type");
const jokeContainer = document.getElementById("joke-container");
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const authToken = localStorage.getItem("authToken");

// Event listeners
jokeForm.addEventListener("submit", generateJoke);
registerForm.addEventListener("submit", registerUser);
loginForm.addEventListener("submit", loginUser);

// Check if user is authenticated
if (authToken) {
  // Hide authentication forms
  document.getElementById("auth-container").style.display = "none";
  // Show joke generation form
  jokeForm.style.display = "block";
} else {
  // Hide joke generation form
  jokeForm.style.display = "none";
}

// Generate joke
async function generateJoke(event) {
  event.preventDefault();
  const jokeType = jokeTypeSelect.value;

  try {
    const response = await fetch(`/generate?jokeType=${jokeType}`, {
      headers: {
        Authorization: authToken,
      },
    });

    if (response.ok) {
      const { joke } = await response.json();
      displayJoke(joke);
    } else {
      const { message } = await response.json();
      displayError(message);
    }
  } catch (error) {
    console.error("Error generating joke:", error);
    displayError("An error occurred while generating the joke");
  }
}

// Register user
async function registerUser(event) {
  event.preventDefault();
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  console.log(email,password);

  try {
    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      displayMessage("User registered successfully");
    } else {
      const { message } = await response.json();
      displayError(message);
    }
  } catch (error) {
    console.error("Error registering user:", error);
    displayError("An error occurred while registering the user");
  }
}

// Login user
async function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const { token } = await response.json();
      localStorage.setItem("authToken", token);
      // Hide authentication forms
      document.getElementById("auth-container").style.display = "none";
      // Show joke generation form
      jokeForm.style.display = "block";
      displayMessage("User logged in successfully");
    } else {
      const { message } = await response.json();
      displayError(message);
    }
  } catch (error) {
    console.error("Error logging in:", error);
    displayError("An error occurred while logging in");
  }
}

// Display joke
function displayJoke(joke) {
  jokeContainer.innerHTML = `<p>${joke}</p>`;
}

// Display error message
function displayError(message) {
  jokeContainer.innerHTML = `<p class="error">${message}</p>`;
}

// Display success message
function displayMessage(message) {
  jokeContainer.innerHTML = `<p class="success">${message}</p>`;
}
