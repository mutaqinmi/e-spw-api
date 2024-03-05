$(() => {
    const menuButton = $(".menu-button");
    const bodyWidth = window.matchMedia("(max-width: 768px)").matches;

    // if(!bodyWidth){
    //     $(".menu-button > *").removeClass("menu-button-mobile")
    //     $(".sidenav").removeClass("sidenav-close");
    //     $(".nav-title").removeClass("hide");
    //     $(".sidenav-brand-image").removeClass("hide");
    //     $(".nav-link").removeClass("nav-link-mobile");
    //     $(".active").removeClass("active-mobile");

    //     $(".container").removeClass("expand");
    // } else {
    //     $(".menu-button > *").addClass("menu-button-mobile")
    //     $(".sidenav").addClass("sidenav-close");
    //     $(".nav-title").addClass("hide");
    //     $(".sidenav-brand-image").addClass("hide");
    //     $(".nav-link").addClass("nav-link-mobile");
    //     $(".active").addClass("active-mobile");

    //     $(".container").addClass("expand");
    // }

    // $(window).on("resize", () => {
    //     const bodyWidth = window.matchMedia("(max-width: 768px)").matches;
    //     if(!bodyWidth){
    //         $(".menu-button > *").removeClass("menu-button-mobile")
    //         $(".sidenav").removeClass("sidenav-close");
    //         $(".nav-title").removeClass("hide");
    //         $(".sidenav-brand-image").removeClass("hide");
    //         $(".nav-link").removeClass("nav-link-mobile");
    //         $(".active").removeClass("active-mobile");

    //         $(".container").removeClass("expand");
    //     } else {
    //         $(".menu-button > *").addClass("menu-button-mobile")
    //         $(".sidenav").addClass("sidenav-close");
    //         $(".nav-title").addClass("hide");
    //         $(".sidenav-brand-image").addClass("hide");
    //         $(".nav-link").addClass("nav-link-mobile");
    //         $(".active").addClass("active-mobile");

    //         $(".container").addClass("expand");
    //     }
    // })

    menuButton.on("click", () => {
        // $(".menu-button > *").toggleClass("menu-button-mobile")
        // $(".sidenav").toggleClass("sidenav-close");
        // $(".nav-title").toggleClass("hide");
        // $(".sidenav-brand-image").toggleClass("hide");
        // $(".nav-link").toggleClass("nav-link-mobile");
        // $(".active").toggleClass("active-mobile");

        // $(".container").toggleClass("expand");
    })
})