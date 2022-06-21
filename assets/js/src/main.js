//main js file
//stuff here
$(document).ready(function () {
    console.log("scripts germina v");
    var body = $("body");
    var brand = $("a.navbar-brand");
    var navbarwrap = $("nav.navbar-fixed-top");
    var navbar = $("#germina-menu");
    var togglenavbar = $(".navbar-toggle");
    var presentation = $(".presentation");

    var videocontrol = $(".video-control");
    var videobj = $(".germina-video-container video.video-germina");

    var proyectlist = $("div.full-proylist");
    var ptypenavitems = $("div.ptype-nav a");

    var typebuttons = $("div.ptype-nav a");

    let logocolor = $("img.logo-color");
    let logoblanco = $("img.logo-blanco");

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

    $("#taxonomy-accordion").on("shown.bs.collapse", function () {
        $(".panel-collapse.in").prev(".panel-heading").addClass("active");
        $(".panel-collapse.in").parent(".panel-default").addClass("active");
    });

    $("#taxonomy-accordion").on("hide.bs.collapse", function () {
        $(".panel-heading").removeClass("active");
        $(".panel-default.active").removeClass("active");
    });

    $('a[data-toggle="showparent"]').on("click", function () {
        $("#taxonomy-accordion").show();
        $(".subpanel").not(".hidden").addClass("hidden");
    });

    $(".childterms-call").on("click", function () {
        let slug = $(this).attr("data-termslug");
        $("#taxonomy-accordion").hide();
        $("#childpanel-" + slug).removeClass("hidden");
    });

    $(".dropdown a.dropdown-submenu").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("dropdown click");
        let nextDropdown = $(this).next(".dropdown-menu");
        if (nextDropdown.hasClass("open")) {
            nextDropdown.hide().removeClass("open");
        } else {
            nextDropdown.show().addClass("open");
        }
    });

    // Wrap IIFE around your code
    (function ($, viewport) {
        $(document).ready(function () {
            // Executes only in XS breakpoint
            if (viewport.is("xs")) {
                $(window).on("scroll", function () {});

                navbar.on("show.bs.collapse", function () {
                    navbarwrap.addClass("unfolded");
                });

                navbar.on("hidden.bs.collapse", function () {
                    if (presentation.visible()) {
                        //brand.fadeOut();
                        //navbar.addClass("without-brand");
                    }
                    $(".navbar-header").removeClass("open");

                    navbarwrap.removeClass("unfolded");
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

                //Colapsable de filtros para móvil
                $(".filter-heading-toggle").on("click", function () {
                    let dataTarget = $($(this).attr("data-target"));
                    $(this).toggleClass("active");
                    dataTarget.toggleClass("active");
                });
            }

            // Executes in SM, MD and LG breakpoints
            if (viewport.is(">=sm")) {
                console.log("proyectos-home");
                // $(".proyectos-home, .full-proylist").masonry({
                //     itemSelector: ".proyect-item-box",
                // });

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
