const login = async (req, res) => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const data = {
    email,
    password,
  };
  try {
    const response =await fetch("http://localhost:8000/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if(!response.ok){
        const errorData = await response.json();
        console.error("Login failed", errorData.message);
        alert(`Error : ${errorData.message}`)
        return;
    }
    const responseData = await response.json();
    console.log("Login successful", responseData);
    localStorage.setItem("token",responseData.token);
    alert("Login successful")
    window.location.href="main.html"
  } catch (error) {
    console.error(error);
    alert("An error occured. Please try again");
  }
};
