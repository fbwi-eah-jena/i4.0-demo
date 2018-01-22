var refresh_rate = 11; //<-- In seconds, change to your needs
var last_user_action = 0;
var has_focus = false;
var lost_focus_count = 0;
var focus_margin = 10; // If we lose focus more then the margin we want to refresh


function reset() {
    last_user_action = 0;
    console.log("Reset");
}

function windowHasFocus() {
    has_focus = true;
}

function windowLostFocus() {
    has_focus = false;
    lost_focus_count++;
    console.log(lost_focus_count + " <~ Lost Focus");
}

setInterval(function () {
    last_user_action++;
    refreshCheck();
}, 1000);

function refreshCheck() {
    var focus = window.onfocus;
    if ((last_user_action >= refresh_rate && !has_focus && document.readyState == "complete") || lost_focus_count > focus_margin) {
        window.location.reload(); // If this is called no reset is needed
        reset(); // We want to reset just to make sure the location reload is not called.
    }

}
window.addEventListener("focus", windowHasFocus, false);
window.addEventListener("blur", windowLostFocus, false);
window.addEventListener("click", reset, false);
window.addEventListener("mousemove", reset, false);
window.addEventListener("keypress", reset, false);