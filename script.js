function validate() {
    let pass = document.getElementsByName("pass")[0].value;
    let cpass = document.getElementsByName("cpass")[0].value;

    if (pass !== cpass) {
        alert("Passwords do not match");
        return false;
    }

    if (pass.length < 6) {
        alert("Password must be at least 6 characters");
        return false;
    }

    return true;
}