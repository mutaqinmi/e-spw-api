$(() => {
    const menuButton = $(".menu-button");
    const garis1 = $(".garis1");
    const garis2 = $(".garis2");
    const garis3 = $(".garis3");
    
    menuButton.on("click", () => {
        garis2.toggleClass("none");
        garis1.toggleClass("rotate-right");
        garis3.toggleClass("rotate-left");
    })
})