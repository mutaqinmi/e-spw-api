$(() => {
    $("#show").on("click", () => {
        if($("#show").is(":checked")){
            $("#password").attr("type", "text");
            $("#show-symbol").removeClass("ph-eye-slash");
            $("#show-symbol").addClass("ph-eye");
        } else {
            $("#password").attr("type", "password");
            $("#show-symbol").removeClass("ph-eye");
            $("#show-symbol").addClass("ph-eye-slash");
        }
    })
})