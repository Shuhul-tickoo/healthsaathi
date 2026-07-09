const OPENROUTER_API_KEY = "your_api_key_here";

let userProfile = {};

function saveProfile() {
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const weight = document.getElementById("weight").value;
  const height = document.getElementById("height").value;
  const diet = document.getElementById("diet").value;
  const goal = document.getElementById("goal").value;

  if (!name || !age || !weight || !height) {
    alert("Please fill in all fields!");
    return;
  }

  const heightM = height / 100;
  const bmi = (weight / (heightM * heightM)).toFixed(1);

  let bmiCategory = "";
  if (bmi < 18.5) bmiCategory = "Underweight";
  else if (bmi < 25) bmiCategory = "Normal weight";
  else if (bmi < 30) bmiCategory = "Overweight";
  else bmiCategory = "Obese";

  userProfile = { name, age, weight, height, diet, goal, bmi, bmiCategory };

  localStorage.setItem("healthsaathi_profile", JSON.stringify(userProfile));

  document.getElementById("log-section").classList.remove("hidden");

  alert(`Profile saved! Your BMI is ${bmi} (${bmiCategory})`);
}

async function getAdvice() {
  const food = document.getElementById("food-log").value;
  const exercise = document.getElementById("exercise-log").value;

  if (!food && !exercise) {
    alert("Please log at least your food or exercise for today!");
    return;
  }

  const adviceSection = document.getElementById("advice-section");
  const adviceText = document.getElementById("advice-text");

  adviceSection.classList.remove("hidden");
  adviceText.textContent = "Your health coach is thinking... 🌿";

  const prompt = `
You are HealthSaathi, a warm and knowledgeable Indian health coach. 
You understand Indian food, Indian lifestyle, Indian summers, and the reality of how Indians eat and live.
Never suggest Western foods as replacements. Always suggest Indian alternatives.
Be encouraging but honest. Keep advice practical and realistic for an Indian college student.

User Profile:
- Name: ${userProfile.name}
- Age: ${userProfile.age} years
- Weight: ${userProfile.weight} kg
- Height: ${userProfile.height} cm
- BMI: ${userProfile.bmi} (${userProfile.bmiCategory})
- Diet Type: ${userProfile.diet}
- Health Goal: ${userProfile.goal}

Today's Log:
- Food eaten: ${food || "Not logged"}
- Exercise done: ${exercise || "Not logged"}

Give personalised feedback on:
1. How today's food was (good or bad for their goal)
2. Whether their exercise was enough
3. Two specific suggestions for tomorrow (Indian food and exercise)
4. One motivational line at the end

Keep it friendly, like a knowledgeable older sibling who genuinely cares.
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${OPENROUTER_API_KEY}`
  },
  body: JSON.stringify({
    model: "meta-llama/llama-3.3-8b-instruct:free",
    messages: [{ role: "user", content: prompt }]
  })
});

const data = await response.json();
const reply = data.choices[0].message.content;
adviceText.textContent = reply;

  } catch (error) {
    adviceText.textContent = "Something went wrong. Check your API key and try again.";
    console.error(error);
  }
}

window.onload = function () {
  const saved = localStorage.getItem("healthsaathi_profile");
  if (saved) {
    userProfile = JSON.parse(saved);
    document.getElementById("log-section").classList.remove("hidden");
  }
};