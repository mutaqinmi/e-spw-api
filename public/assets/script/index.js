$(() => {
    const menuButton = $(".menu-button");
    const menuLink = $(".menu-link");
    const garis1 = $(".garis1");
    const garis2 = $(".garis2");
    const garis3 = $(".garis3");
    
    $(window).on("resize", () => {
        const bodyWidth = window.matchMedia("(max-width: 768px)").matches;
        if(!bodyWidth){
            menuLink.removeClass("hide");
        } else {
            menuLink.addClass("hide");
        }
    })

    menuButton.on("click", () => {
        menuLink.toggleClass("hide");
        garis2.toggleClass("hide");
        garis1.toggleClass("rotate-right");
        garis3.toggleClass("rotate-left");
    })
})