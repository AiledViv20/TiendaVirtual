$(document).ready(function() {
    let homeActive = $('#btn-home')
    let loginActive = $('#btn-login')
    let registryActive = $('#btn-registry')
    $('#btn-login').on('click', function() {
        if(!loginActive.hasClass("active")) {
            homeActive.removeClass("active")
            registryActive.removeClass("active")
            loginActive.removeClass("active")
            loginActive.addClass("active")
        }
    });
});

