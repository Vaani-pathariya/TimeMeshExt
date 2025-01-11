let secondsElapsed = 0;
let breakTime = 0;
let clockState = "start";
let descriptions = []
const audio = new Audio("audio.mp3");
const updateDesc=()=>{
    const dropdown = document.getElementById("descriptionDropdown")
    descriptions.forEach(desc=>{
        const option = document.createElement("option");
        option.value=desc;
        option.innerText=desc
        dropdown.appendChild(option);
    })
}
const initialDescriptions=async()=>{
    try{
        const response = await fetch("http://localhost:8000/time/desc",{
            method: "GET",
            headers:{
                "Content-Type":"Application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        })
        if(!response.ok){
            const errorData = await response.json();
            console.error("Description fetch failed", errorData.message);
            alert(`Error : ${errorData.message}`)
            return;
        }
        const responseData = await response.json();
        descriptions= responseData.descriptions
        updateDesc()
    }
    catch(error){
        console.error(error.message);
        alert("An error occured. Please try again");
    }
}
window.onload=()=>{
    initialDescriptions();
}
const increment = (value, id) => {
  if (id === "workTimer" && value % 1800 == 0) {
    runAudio();
  }
  const text = document.getElementById(id);
  const hours = Math.floor(value / 3600);
  value -= 3600 * hours;
  const minutes = Math.floor(value / 60);
  value -= 60 * minutes;
  text.innerText = `${hours > 0 ? (hours > 9 ? hours : "0" + hours) : "00"}:${
    minutes > 0 ? (minutes > 9 ? minutes : "0" + minutes) : "00"
  }:${value > 0 ? (value > 9 ? value : "0" + value) : "00"}`;
};
const startTimer = () => {
  if (clockState === "start") {
    clockState = "running";
    timerInterval = setInterval(() => {
      secondsElapsed++;
      increment(secondsElapsed, "workTimer");
    }, 1000);
  }
};
const sendTime = async (duration) => {
  const description = document.getElementById("Description").value.trim();
  const data = {
    duration,
    description,
  };
  try {
    const response = await fetch("http://localhost:8000/time/add", {
      method: "POST",
      headers: {
        "Content-Type": "Application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error(errorData.message);
      alert(`Error ${errorData.message}`);
      return;
    }
    const responseData = await response.json();
    descriptions = responseData.updatedDescriptions
    updateDesc();
    alert("Data saved successfully");
    document.getElementById("Description").value = "";
  } catch (error) {
    console.error(error);
    alert("Error sending duration data");
  }
};
const stopTimer = () => {
  if (clockState === "running") {
    clearInterval(timerInterval);
    clockState = "break";
    document.getElementById("workTimer").innerText = "00:00:00";
  }
  sendTime(secondsElapsed);
  let min = Math.floor(secondsElapsed / 60);
  if (min <= 15) {
    breakTime = 60;
  } else if (min <= 25) {
    breakTime = 5 * 60;
  } else if (min <= 50) {
    breakTime = 8 * 60;
  } else if (min <= 90) {
    breakTime = 15 * 60;
  } else {
    breakTime = 20 * 60;
  }
  secondsElapsed = 0;
  breakTimer();
};
const resetTimer = () => {
  clearInterval(timerInterval);
  secondsElapsed = 0;
  document.getElementById("workTimer").innerText = "00:00:00";
  document.getElementById("breakTimer").innerText = "00:00:00";
  clockState = "start";
};
const runAudio = () => {
  audio.play();
};
const stopAudio = ()=>{
    audio.pause();
    audio.currentTime=0;
}
const breakTimer = () => {
  if (clockState === "break") {
    timerInterval = setInterval(() => {
      if (breakTime > 0) {
        breakTime--;
        increment(breakTime, "breakTimer");
      } else {
        runAudio();
        clearInterval(timerInterval);
        clockState = "start";
        startTimer();
      }
    }, 1000);
  }
};
const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/user.html";
};
