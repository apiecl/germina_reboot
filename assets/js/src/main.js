//main js file
//stuff here
$(document).ready(function () {
    console.log("scripts germina v");
    var body = $("body");
    var brand = $("a.navbar-brand");
    var navbar = $("#germina-menu");
    var togglenavbar = $(".navbar-toggle");
    var presentation = $(".presentation");

    var videocontrol = $(".video-control");
    var videobj = $(".germina-video-container video.video-germina");

    var proyectlist = $("div.full-proylist");
    var ptypenavitems = $("div.ptype-nav a");

    var typebuttons = $("div.ptype-nav a");

    typebuttons.each(function (index, element) {
        var filter = $(element).attr("data-filter");
        var countelements = $(
            'div.tax-item-medium[data-type="' + filter + '"]'
        ).length;

        if (countelements < 1) {
            $(element).hide();
        }
    });

    videocontrol.on("click", function () {
        $(this)
            .empty()
            .append(
                '<video class="video-germina video-js" src="' +
                    germina.video_url +
                    '">Se necesita un navegador compatible con HTML5 para ver este video.</video>'
            );
    });

    //Filter type in taxview

    ptypenavitems.on("click", function () {
        var tofilter = $(this).attr("data-filter");
        var taxitems = $("div.tax-item-medium");

        if ($(this).hasClass("active")) {
            taxitems.show();
            $(this).removeClass("active");
        } else {
            taxitems.hide();

            $('div[data-type="' + tofilter + '"]').show();

            ptypenavitems.removeClass("active");
            $(this).toggleClass("active");
        }
    });

    //Ajax calls for proyects

    $("body").on("click", ".proyect-call", function () {
        //Cosas que hacer
        //1. Impedir que se solicite mientras está cargando
        if ($(this).hasClass("loading") !== true) {
            $(this).addClass("loading");

            germina_loadprojects($(this));
        } //End comprobation of loading class
    });

    //Portafolio
    var portafolio = $("body.home .portafolio-content");

    portafolio.cycle({
        slides: "> .item-large",
        fx: "fade",
        timeout: 0,
        pager: ".cycle-pager",
        prev: ".cycle-prev",
        next: ".cycle-next",
        swipe: true,
        "swipe-fx": "none",
    });

    portafolio.on(
        "cycle-update-view",
        function (event, optionHash, slideOptionHash, currentslideEl) {
            $(".animated", portafolio).hide();
            $(".animated", currentslideEl).show();
        }
    );

    // Wrap IIFE around your code
    (function ($, viewport) {
        $(document).ready(function () {
            // Executes only in XS breakpoint
            if (viewport.is("xs")) {
                if (body.hasClass("home")) {
                    brand.hide();
                    navbar.addClass("without-brand");
                }

                $(window).on("scroll", function () {
                    if (presentation.visible()) {
                        brand.fadeOut();
                        navbar.addClass("without-brand");
                    } else {
                        brand.show();
                        navbar.removeClass("without-brand");
                    }
                });

                navbar.on("show.bs.collapse", function () {
                    if (brand.visible() === false) {
                        brand.show();
                        navbar.removeClass("without-brand");
                    }
                });

                navbar.on("hidden.bs.collapse", function () {
                    if (presentation.visible()) {
                        brand.fadeOut();
                        navbar.addClass("without-brand");
                    }
                });

                //Botones que muestran navegación
                $('a[data-function="toggle-nav"]').on("click", function () {
                    var el = $(
                        '[data-id="' + $(this).attr("data-target") + '"]'
                    );

                    if (el.hasClass("active")) {
                        el.removeClass("active");
                    } else {
                        el.addClass("active");
                    }
                });
            }

            // Executes in SM, MD and LG breakpoints
            if (viewport.is(">=sm")) {
                console.log("proyectos-home");
                $(".proyectos-home, .full-proylist").masonry({
                    itemSelector: ".proyect-item-box",
                });

                var $grid = $(".full-publist-items").imagesLoaded(function () {
                    $grid.masonry({
                        itemSelector: ".col-md-6",
                    });
                });

                var $pubgrid = $(".publicaciones-wrapper").imagesLoaded(
                    function () {
                        $pubgrid.masonry({
                            itemSelector: ".publicacion-item-medium",
                        });
                    }
                );

                var $attachedgrid = $(
                    "div.attached-to-post.Miniaturas"
                ).imagesLoaded(function () {
                    $attachedgrid.masonry({
                        itemSelector: ".attached-file-block",
                    });
                });
            }

            // Executes in XS and SM breakpoints
            if (viewport.is("<md")) {
                //...
            }

            // Execute code each time window size changes
            $(window).resize(
                viewport.changed(function () {
                    if (viewport.is("xs")) {
                        // ...
                    }
                })
            );
        });
    })(jQuery, ResponsiveBootstrapToolkit);
});
