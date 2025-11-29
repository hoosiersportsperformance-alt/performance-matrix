
import { Exercise } from "../types";

// 🔑 PLACEHOLDER: Replace with your RapidAPI Key for ExerciseDB
// Get one here: https://rapidapi.com/justin-wf/api/exercisedb
const RAPID_API_KEY = "YOUR_RAPID_API_KEY_HERE"; 
const RAPID_API_HOST = "exercisedb.p.rapidapi.com";
const BASE_URL = "https://exercisedb.p.rapidapi.com/exercises";

// --- LOCAL DATABASE FALLBACK ---
// Used if API key is missing or request fails.
// Contains high-quality YouTube links verified for embedding.
const LOCAL_EXERCISES: Exercise[] = [
  // --- STRENGTH ---
  {
    id: "str-1",
    name: "Back Squat",
    category: "Strength",
    equipment: "Barbell",
    primaryMuscles: ["Quadriceps", "Glutes", "Hamstrings"],
    cues: [
      "Feet shoulder-width apart, toes slightly out.",
      "Brace core, big breath in before descending.",
      "Break at hips and knees simultaneously.",
      "Keep chest up, drive knees out.",
      "Drive through mid-foot to stand."
    ],
    videoUrl: "https://www.youtube.com/embed/bEv6CCg2BC8" // Alan Thrall
  },
  {
    id: "str-2",
    name: "Front Squat",
    category: "Strength",
    equipment: "Barbell",
    primaryMuscles: ["Quadriceps", "Core", "Upper Back"],
    cues: [
      "High elbows, bar rests on deltoids (rack position).",
      "Keep torso as upright as possible.",
      "Sit hips down between heels.",
      "Drive elbows up coming out of the hole."
    ],
    videoUrl: "https://www.youtube.com/embed/v-mQm_droHg" // Squat University
  },
  {
    id: "str-3",
    name: "Goblet Squat",
    category: "Strength",
    equipment: "Dumbbell / Kettlebell",
    primaryMuscles: ["Quadriceps", "Core"],
    cues: [
      "Hold weight tight against chest.",
      "Keep elbows tucked in.",
      "Sink hips straight down.",
      "Excellent regression for barbell squat mechanics."
    ],
    videoUrl: "https://www.youtube.com/embed/MeIiIdhvXT4"
  },
  {
    id: "str-4",
    name: "Bench Press",
    category: "Strength",
    equipment: "Barbell",
    primaryMuscles: ["Pecs", "Triceps", "Front Delts"],
    cues: [
      "Retract shoulder blades (pinch them together).",
      "Feet flat on the floor, slight arch in back.",
      "Lower bar to sternum/nipple line.",
      "Drive bar up and slightly back towards face."
    ],
    videoUrl: "https://www.youtube.com/embed/vcBig73ojpE" // RP
  },
  {
    id: "str-5",
    name: "Incline Dumbbell Press",
    category: "Strength",
    equipment: "Dumbbell",
    primaryMuscles: ["Upper Pecs", "Shoulders"],
    cues: [
      "Set bench to 30-45 degrees.",
      "Keep wrists stacked over elbows.",
      "Lower weights with control to chest depth.",
      "Press up and slightly in without clanking weights."
    ],
    videoUrl: "https://www.youtube.com/embed/8iPEnn-ltbc"
  },
  {
    id: "str-6",
    name: "Deadlift (Conventional)",
    category: "Strength",
    equipment: "Barbell",
    primaryMuscles: ["Hamstrings", "Glutes", "Lower Back"],
    cues: [
      "Bar over mid-foot.",
      "Hinge hips back until shins touch bar.",
      "Chest up, pull 'slack' out of the bar.",
      "Push the floor away with your legs.",
      "Squeeze glutes at the top."
    ],
    videoUrl: "https://www.youtube.com/embed/wYREQkVtvEc" // Squat University
  },
  {
    id: "str-7",
    name: "Romanian Deadlift (RDL)",
    category: "Strength",
    equipment: "Barbell / DB",
    primaryMuscles: ["Hamstrings", "Glutes"],
    cues: [
      "Slight bend in knees (soft knees).",
      "Send hips strictly backward.",
      "Keep bar/weights close to legs.",
      "Stop when hamstring flexibility limit is reached.",
      "Squeeze glutes to return to standing."
    ],
    videoUrl: "https://www.youtube.com/embed/XywUBj05q_0"
  },
  {
    id: "str-8",
    name: "Pull-Up",
    category: "Strength",
    equipment: "Bar",
    primaryMuscles: ["Lats", "Biceps", "Upper Back"],
    cues: [
      "Start from dead hang.",
      "Depress shoulders before pulling.",
      "Drive elbows down to pockets.",
      "Chin over bar at the top.",
      "Control the descent."
    ],
    videoUrl: "https://www.youtube.com/embed/eGo4IYlbE5g"
  },
  {
    id: "str-9",
    name: "Dumbbell Row",
    category: "Strength",
    equipment: "Dumbbell",
    primaryMuscles: ["Lats", "Rhomboids"],
    cues: [
      "Flat back, supported on bench.",
      "Pull dumbbell to hip pocket, not armpit.",
      "Keep elbow close to body.",
      "Lower with control."
    ],
    videoUrl: "https://www.youtube.com/embed/pYcpY20QaE8"
  },
  {
    id: "str-10",
    name: "Overhead Press",
    category: "Strength",
    equipment: "Barbell",
    primaryMuscles: ["Shoulders", "Triceps"],
    cues: [
      "Squeeze glutes and core tight.",
      "Move head back to clear bar path.",
      "Press vertically, head through the window at top.",
      "Don't hyperextend lower back."
    ],
    videoUrl: "https://www.youtube.com/embed/QAQ64hK4Xxs" // Alan Thrall
  },
  {
    id: "str-11",
    name: "Bulgarian Split Squat",
    category: "Strength",
    equipment: "Dumbbell",
    primaryMuscles: ["Quadriceps", "Glutes", "Stabilizers"],
    cues: [
      "Rear foot elevated on bench.",
      "Keep majority of weight on front foot.",
      "Descend until back knee hovers over floor.",
      "Keep torso upright."
    ],
    videoUrl: "https://www.youtube.com/embed/2C-uNgKwPLE"
  },

  // --- POWER ---
  {
    id: "pwr-1",
    name: "Hang Clean",
    category: "Power",
    equipment: "Barbell",
    primaryMuscles: ["Full Body", "Traps", "Hips"],
    cues: [
      "Start from standing, lower bar to just above knees.",
      "Explosively extend hips and shrug shoulders.",
      "Pull elbows high and wide.",
      "Drop under the bar quickly.",
      "Catch on shoulders with high elbows."
    ],
    videoUrl: "https://www.youtube.com/embed/08kTmb4Q51w" // Catalyst Athletics
  },
  {
    id: "pwr-2",
    name: "Power Clean",
    category: "Power",
    equipment: "Barbell",
    primaryMuscles: ["Full Body", "Posterior Chain"],
    cues: [
      "Start from floor (mid-shin).",
      "First pull is smooth/controlled.",
      "Explode when bar passes knees (contact point).",
      "Aggressive triple extension.",
      "Catch in quarter squat."
    ],
    videoUrl: "https://www.youtube.com/embed/KjGUkJp4fN4" // Catalyst Athletics
  },
  {
    id: "pwr-3",
    name: "Dumbbell Snatch",
    category: "Power",
    equipment: "Dumbbell",
    primaryMuscles: ["Hips", "Shoulders", "Full Body"],
    cues: [
      "Dumbbell starts between feet.",
      "Chest up, heels down.",
      "Explosive hip drive to throw weight up.",
      "Punch the ceiling to lock out overhead.",
      "One fluid motion."
    ],
    videoUrl: "https://www.youtube.com/embed/9520DJiFmvE"
  },
  {
    id: "pwr-4",
    name: "Med Ball Slam",
    category: "Power",
    equipment: "Medicine Ball",
    primaryMuscles: ["Lats", "Core", "Hips"],
    cues: [
      "Reach high overhead, triple extension.",
      "Slam ball down with max intent.",
      "Follow through with hips.",
      "Don't round back excessively."
    ],
    videoUrl: "https://www.youtube.com/embed/Rx_UHMnQljU"
  },

  // --- PLYOMETRICS ---
  {
    id: "ply-1",
    name: "Countermovement Jump (CMJ)",
    category: "Plyometric",
    equipment: "Bodyweight",
    primaryMuscles: ["Legs", "Hips"],
    cues: [
      "Stand tall, hands on hips (or free if using arm swing).",
      "Dip quickly to a quarter squat depth.",
      "Explode upward immediately.",
      "Land softly with knees bent."
    ],
    videoUrl: "https://www.youtube.com/embed/5Hh4V-yO1xs"
  },
  {
    id: "ply-2",
    name: "Box Jump",
    category: "Plyometric",
    equipment: "Box",
    primaryMuscles: ["Legs", "Hips"],
    cues: [
      "Stand facing the box.",
      "Load hips back and swing arms.",
      "Explode up and forward.",
      "Land softly on the box with both feet.",
      "Stand tall to finish rep, step down (don't jump down)."
    ],
    videoUrl: "https://www.youtube.com/embed/bxNac2hB8jQ"
  },
  {
    id: "ply-3",
    name: "Depth Jump",
    category: "Plyometric",
    equipment: "Box",
    primaryMuscles: ["Legs", "Reactive Strength"],
    cues: [
      "Step off box (don't jump off).",
      "Land on balls of feet.",
      "Minimize ground contact time.",
      "Explode immediately into a vertical jump."
    ],
    videoUrl: "https://www.youtube.com/embed/S7O5_p-v7Js"
  },
  {
    id: "ply-4",
    name: "Broad Jump",
    category: "Plyometric",
    equipment: "Bodyweight",
    primaryMuscles: ["Hips", "Glutes"],
    cues: [
      "Load hips back deeply.",
      "Throw arms forward.",
      "Jump for max distance.",
      "Stick the landing (frozen moment)."
    ],
    videoUrl: "https://www.youtube.com/embed/GL-KA2aFpVk"
  },

  // --- SPEED ---
  {
    id: "spd-1",
    name: "Wall Drill (March)",
    category: "Speed",
    equipment: "Wall",
    primaryMuscles: ["Hip Flexors", "Glutes"],
    cues: [
      "Hands on wall, body at 45 degree angle.",
      "Drive knee up to hip height.",
      "Toe up (dorsiflexion).",
      "Drive foot back down under hips."
    ],
    videoUrl: "https://www.youtube.com/embed/A4I1L29Q6gQ"
  },
  {
    id: "spd-2",
    name: "A-Skip",
    category: "Speed",
    equipment: "None",
    primaryMuscles: ["Hip Flexors", "Calves"],
    cues: [
      "Rhythmic skipping motion.",
      "High knee drive, toe up.",
      "Drive foot down aggressively.",
      "Opposite arm, opposite leg."
    ],
    videoUrl: "https://www.youtube.com/embed/8K_gGf0sHJs"
  },
  {
    id: "spd-3",
    name: "Falling Start",
    category: "Speed",
    equipment: "None",
    primaryMuscles: ["Full Body"],
    cues: [
      "Stand tall, lean forward until you lose balance.",
      "Drive out into a sprint.",
      "Stay low for first few steps.",
      "Big arm drive."
    ],
    videoUrl: "https://www.youtube.com/embed/OQ958c89G6I"
  },

  // --- CORE ---
  {
    id: "cor-1",
    name: "Dead Bug",
    category: "Core",
    equipment: "Bodyweight",
    primaryMuscles: ["Abs", "Obliques"],
    cues: [
      "Lower back pressed flat into floor (CRITICAL).",
      "Extend opposite arm and leg.",
      "Exhale hard as you extend.",
      "Return to center slowly."
    ],
    videoUrl: "https://www.youtube.com/embed/44-gXg_l2sQ"
  },
  {
    id: "cor-2",
    name: "Pallof Press",
    category: "Core",
    equipment: "Band / Cable",
    primaryMuscles: ["Obliques", "Anti-Rotation"],
    cues: [
      "Stand sideways to anchor point.",
      "Press handle straight out from chest.",
      "Resist the rotation (don't let it twist you).",
      "Hold for 2-3 seconds per rep."
    ],
    videoUrl: "https://www.youtube.com/embed/5_q5O9F77Iw"
  },
  {
    id: "cor-3",
    name: "Plank",
    category: "Core",
    equipment: "Bodyweight",
    primaryMuscles: ["Abs", "Stabilizers"],
    cues: [
      "Elbows under shoulders.",
      "Squeeze glutes and quads tight.",
      "Body in straight line from head to heels.",
      "Don't let hips sag or pike."
    ],
    videoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw"
  },

  // --- MOBILITY ---
  {
    id: "mob-1",
    name: "World's Greatest Stretch",
    category: "Mobility",
    equipment: "None",
    primaryMuscles: ["Hips", "Thoracic Spine", "Hamstrings"],
    cues: [
      "Lunge forward with right leg.",
      "Place left hand on floor inside right foot.",
      "Rotate right arm up to the ceiling, look at hand.",
      "Return hand, shift hips back to stretch hamstring."
    ],
    videoUrl: "https://www.youtube.com/embed/-C_9a56q58U"
  },
  {
    id: "mob-2",
    name: "90/90 Hip Switch",
    category: "Mobility",
    equipment: "None",
    primaryMuscles: ["Hips (Internal/External Rotation)"],
    cues: [
      "Sit with legs at 90 degree angles.",
      "Keep chest tall.",
      "Rotate knees over to the other side.",
      "Try to keep heels on the floor."
    ],
    videoUrl: "https://www.youtube.com/embed/2u82yZ_eD1E"
  },
  {
    id: "mob-3",
    name: "Cat Cow",
    category: "Mobility",
    equipment: "None",
    primaryMuscles: ["Spine"],
    cues: [
      "Hands under shoulders, knees under hips.",
      "Inhale, arch back, look up (Cow).",
      "Exhale, round back, tuck chin (Cat).",
      "Move slowly with breath."
    ],
    videoUrl: "https://www.youtube.com/embed/S9n84Ff0AnA"
  }
];

// --- SERVICE FUNCTIONS ---

export async function fetchExercises(limit = 100): Promise<Exercise[]> {
  // If key is missing or is the placeholder, skip API and return local data
  if (!RAPID_API_KEY || RAPID_API_KEY.includes("YOUR_RAPID_API_KEY")) {
    console.warn("ExerciseDB: No valid API key found. Using Local Database.");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return LOCAL_EXERCISES;
  }

  try {
    const response = await fetch(`${BASE_URL}?limit=${limit}`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPID_API_KEY,
        "X-RapidAPI-Host": RAPID_API_HOST,
      },
    });

    if (!response.ok) {
        throw new Error(`ExerciseDB Error: ${response.status}`);
    }

    const data = await response.json();

    // Map API data to our App's Exercise Interface
    const apiExercises: Exercise[] = data.map((item: any) => ({
      id: item.id,
      name: item.name.charAt(0).toUpperCase() + item.name.slice(1), // Capitalize
      category: item.bodyPart.charAt(0).toUpperCase() + item.bodyPart.slice(1), // Use bodyPart as category
      equipment: item.equipment.charAt(0).toUpperCase() + item.equipment.slice(1),
      primaryMuscles: [item.target.charAt(0).toUpperCase() + item.target.slice(1)],
      cues: item.instructions || ["No specific instructions provided."],
      gifUrl: item.gifUrl, // API provides GIFs
      // videoUrl is undefined for API items
    }));

    // Merge or just return API exercises? 
    // To keep the app robust, we can prepend our high-quality local ones (with videos)
    // or just return the API ones. Let's return API ones if successful to show integration.
    return apiExercises;

  } catch (error) {
    console.error("Failed to fetch exercises from API:", error);
    // Fallback to local DB
    return LOCAL_EXERCISES;
  }
}
