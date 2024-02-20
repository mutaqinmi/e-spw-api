$(() => {
    const bodyWidth = window.matchMedia("(max-width: 768px)").matches;
    const menuButton = $(".menu-button");
    const menuLink = $(".menu-link");
    const featureButton = $(".feature-button");
    const featureSubMenu = $(".sub-menu");
    const garis1 = $(".garis1");
    const garis2 = $(".garis2");
    const garis3 = $(".garis3");
    
    if(!bodyWidth){
        menuLink.removeClass("hide");
        garis2.removeClass("hide")
        garis1.removeClass("rotate-right")
        garis3.removeClass("rotate-left")
    } else {
        menuLink.addClass("hide");
        featureButton.on("click", () => {
            featureSubMenu.toggleClass("hide");
        })
    }
    
    $(window).on("resize", () => {
        const bodyWidth = window.matchMedia("(max-width: 768px)").matches;
        if(!bodyWidth){
            menuLink.removeClass("hide");
            garis2.removeClass("hide")
            garis1.removeClass("rotate-right")
            garis3.removeClass("rotate-left")
        } else {
            menuLink.addClass("hide");
            featureButton.on("click", () => {
                featureSubMenu.toggleClass("hide");
            })
        }
    })

    menuButton.on("click", () => {
        menuLink.toggleClass("hide");
        garis2.toggleClass("hide");
        garis1.toggleClass("rotate-right");
        garis3.toggleClass("rotate-left");
    })
})