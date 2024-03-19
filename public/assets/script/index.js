$(() => {
    const bodyWidth = window.matchMedia("(max-width: 768px)").matches;
    const menuButton = $(".menu-button");
    const menuLink = $(".menu-link");
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
        }
    })

    menuButton.on("click", () => {
        menuLink.toggleClass("hide");
        garis2.toggleClass("hide");
        garis1.toggleClass("rotate-right");
        garis3.toggleClass("rotate-left");
    })

    const crc1 = $(".crc1");
    const crc2 = $(".crc2");
    const crc3 = $(".crc3");
    const currentCircleTop1 = parseFloat(crc1.css("top").split("px").slice(0, 1).join());
    const currentCircleBottom2 = parseFloat(crc2.css("bottom").split("px").slice(0, 1).join());
    const currentCircleTop3 = parseFloat(crc3.css("top").split("px").slice(0, 1).join());

    $(window).scroll(() => {
        const scroll = $(window).scrollTop();
        const header = $(".header").innerHeight() - 80;

        const navbar = $(".navbar");
        const brandImage = $(".brand > a > img");
        const menuButton = $(".menu-button > *");
        const navLink = $(".nav-link");
        const active = $(".active");

        const downloadButton = $(".download > a");

        if(header <= scroll){
            navbar.css({
                "backgroundColor": "#ffffff",
            })
            brandImage.attr("src", "assets/icon/espw-colored.png")
            menuButton.css({
                "backgroundColor": "#ff5b00",
            })

            navLink.css({
                "color": "#ff5b00"
            })
            active.css({
                "borderBottom": "2px solid #ff5b00"
            })

            downloadButton.addClass("download-button-colored");

            crc1.css({
                "top": (currentCircleTop1 - (scroll / 10)) + "px",
            })
            crc2.css({
                "bottom": (currentCircleBottom2 - (scroll / 0.75)) + "px",
            })
            crc3.css({
                "top": (currentCircleTop3 - (scroll / 2)) + "px",
            })
        } else {
            navbar.css({
                "backgroundColor": "transparent",
            })
            brandImage.attr("src", "assets/icon/espw-white.png")
            menuButton.css({
                "backgroundColor": "#ffffff",
            })
            
            navLink.css({
                "color": "#ffffff"
            })
            active.css({
                "borderBottom": "2px solid #ffffff"
            })
            
            downloadButton.removeClass("download-button-colored");
            
            crc1.css({
                "top": (currentCircleTop1 + (scroll / 10)) + "px",
            })
            crc2.css({
                "bottom": (currentCircleBottom2 + (scroll / 0.75)) + "px",
            })
            crc3.css({
                "top": (currentCircleTop3 + (scroll / 2)) + "px",
            })
        }
    })
})