function validateForm() {

    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value.trim();
    var mobile = document.getElementById("mobile").value.trim();

    document.getElementById("nameError").innerHTML = "";
    document.getElementById("emailError").innerHTML = "";
    document.getElementById("passwordError").innerHTML = "";
    document.getElementById("mobileError").innerHTML = "";

    var isValid = true;

    if (name === "") {
        document.getElementById("nameError").innerHTML = "Name is required";
        isValid = false;
    }

    if (email === "") {
        document.getElementById("emailError").innerHTML = "Email is required";
        isValid = false;
    } else if (!email.includes("@")) {
        document.getElementById("emailError").innerHTML = "Enter valid email";
        isValid = false;
    }

    if (password.length < 6) {
        document.getElementById("passwordError").innerHTML = "Password must be at least 6 characters";
        isValid = false;
    }

    if (mobile === "") {
    document.getElementById("mobileError").innerHTML = "Mobile number is required";
    isValid = false;
    } 
    else {
    var mobilePattern = /^[0-9]{10}$/;
    if (!mobilePattern.test(mobile)) {
        document.getElementById("mobileError").innerHTML = "Enter valid 10-digit mobile number";
        isValid = false;
    }
}


    if (isValid) {
        alert("Form submitted successfully!");
    }

    return isValid;
}
