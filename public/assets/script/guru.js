$(() => {
    const bodyWidth = window.matchMedia("(max-width: 768px)").matches;
    if(!bodyWidth){
        $(".nav-title").removeClass("hide");
        // $(".sidenav-brand-image").removeClass("hide");
        $(".nav-link").removeClass("nav-link-mobile");
        $(".active").removeClass("active-mobile");
    } else {
        $(".nav-title").addClass("hide");
        // $(".sidenav-brand-image").addClass("hide");
        $(".nav-link").addClass("nav-link-mobile");
        $(".active").addClass("active-mobile");
    }

    $(window).on("resize", () => {
        const bodyWidth = window.matchMedia("(max-width: 768px)").matches;
        if(!bodyWidth){
            $(".nav-title").removeClass("hide");
            // $(".sidenav-brand-image").removeClass("hide");
            $(".nav-link").removeClass("nav-link-mobile");
            $(".active").removeClass("active-mobile");
        } else {
            $(".nav-title").addClass("hide");
            // $(".sidenav-brand-image").addClass("hide");
            $(".nav-link").addClass("nav-link-mobile");
            $(".active").addClass("active-mobile");
        }
    })
})