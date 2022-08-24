//main js file
//stuff here
$(document).ready(function () {
    console.log("scripts germina version " + germina.version);
    var body = $("body");
    var brand = $("a.navbar-brand");
    var navbarwrap = $("nav.navbar-fixed-top");
    var navbar = $("#germina-menu");
    var togglenavbar = $(".navbar-toggle");
    var presentation = $(".presentation");

    var videocontrol = $(".video-control");
    var videobj = $(".germina-video-container video.video-germina");

    var proyectlist = $("div.full-proylist");
    var ptypenavitems = $("div.ptype-nav a.btn-typefilter");

    var typebuttons = $("div.ptype-nav a.btn-typefilter");

    let logocolor = $("img.logo-color");
    let logoblanco = $("img.logo-blanco");
    let dateSorterAjax = $(".date-sorter-ajax");

    dateSorterAjax.hide();

    typebuttons.each(function (index, element) {
        var filter = $(element).attr("data-filter");
        var countelements = $(
            'div.tax-item-medium[data-type="' +
                filter +
                '"], div.item-medium[data-type="' +
                filter +
                '"]'
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

    var allfilter = $('.ptype-nav a[data-filter="all"]');

    ptypenavitems.on("click", function () {
        var tofilter = $(this).attr("data-filter");
        var tofilterlabel = $(this).attr("data-filter-label");
        var taxitems = $("div.tax-item-medium, div.item-medium");
        var total = taxitems.length;
        let taxCount = $("p.taxonomy-results-count");

        if ($(this).hasClass("active")) {
            taxitems.show();
            $(this).removeClass("active");
            taxCount
                .empty()
                .append(`<strong>${total} ${tofilterlabel}</strong>`);
        } else {
            taxitems.hide();
            console.log(
                $('div[data-type="' + tofilter + '"]').length,
                "numero articulos"
            );

            let noFiltered = $('div[data-type="' + tofilter + '"]').length;
            $('div[data-type="' + tofilter + '"]').show();

            allfilter.removeClass("active");
            ptypenavitems.removeClass("active");

            taxCount
                .empty()
                .append(`<strong>${noFiltered} ${tofilterlabel}</strong>`);

            $(this).toggleClass("active");
        }
    });

    allfilter.on("click", function () {
        console.log("all");
        let taxCount = $("p.taxonomy-results-count");
        var taxitems = $("div.tax-item-medium, div.item-medium");
        ptypenavitems.removeClass("active");
        taxitems.show();
        taxCount
            .empty()
            .append(`<strong>${taxitems.length} contenidos</strong>`);
        $(this).addClass("active");
    });

    let $grid = $(".archive.category-publicaciones .full-proylist.row");
    // let $pregrid = $(".lastproys").masonry({
    //     itemSelector: ".document-item-medium",
    //     columnWidth: 208,
    // });
    //masonry in docs
    // let $grid = $(".archive.category-publicaciones .full-proylist.row").masonry(
    //     {
    //         itemSelector: ".document-item-medium",
    //     }
    // );
    // $pregrid.imagesLoaded().progress(function () {
    //     $pregrid.masonry("layout");
    // });

    //Ajax calls for proyects

    $("body").on("click", ".proyect-call", function () {
        //Cosas que hacer
        //1. Impedir que se solicite mientras está cargando
        if ($(this).hasClass("loading") !== true) {
            $(this).addClass("loading");

            //para el resorter
            if ($(this).hasClass("ajax-sort-button")) {
                $(".full-proylist.row").empty();
                $(".order-filter .panel-heading").removeClass("active");
                $(this).parent().parent().addClass("active");
                $("span.labelorder")
                    .empty()
                    .text($(this).attr("data-sort-label"));
                $();
            }
            germina_loadprojects($(this), $grid);
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
        $(".tax-filter .panel-heading").removeClass("active");
        $(".panel-default.active").removeClass("active");
    });

    $(".panel-taxonomy-shortcode").on("shown.bs.collapse", function () {
        $(this).addClass("active");
    });

    $(".panel-taxonomy-shortcode").on("hide.bs.collapse", function () {
        $(this).removeClass("active");
    });

    $('a[data-toggle="showparent"]').on("click", function () {
        $("#taxonomy-accordion").show();
        $(".subpanel").not(".hidden").addClass("hidden");
    });

    $(".childterms-call").on("click", function () {
        let slug = $(this).attr("data-termslug");
        $("#taxonomy-accordion").hide();
        console.log(slug);
        $("#childpanel-" + slug).removeClass("hidden");
    });

    goBack = $("a.goback");
    goBack.hide();

    $(window).on("scroll", function () {
        offset = window.pageYOffset;

        if (offset > 300) {
            goBack.fadeIn();
        }
        if (offset < 300) {
            goBack.fadeOut();
        }
    });

    goBack.on("click", function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
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

    $(".btn-parent-term").on("click", function (e) {
        e.preventDefault();
        $(this).toggleClass("expanded");
        let subTerms = $(this).next(".subterms");
        subTerms.toggleClass("active");
    });

    let searchField = $("input.search-field");

    if (searchField.val().length > 0) {
        $("span.clean").removeClass("hidden");
    }

    searchField.on("change", function () {
        if ($(this).val().length > 0) {
            $("span.clean").removeClass("hidden");
        } else {
            $("span.clean").addClass("hidden");
        }
    });

    $("span.clean").on("click", function () {
        console.log("cleaning");
        if ($(this).attr("data-clean") == "clean-search") {
            window.location = germina.main_url + "/buscar";
        } else {
            window.location.reload();
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
                    $("p.search-results-count").toggleClass("active");
                });
            }

            // Executes in SM, MD and LG breakpoints
            if (viewport.is(">=sm")) {
                // console.log("proyectos-home");
                // // $(".proyectos-home, .full-proylist").masonry({
                // //     itemSelector: ".proyect-item-box",
                // // });
                // var $grid = $(".full-publist-items").imagesLoaded(function () {
                //     $grid.masonry({
                //         itemSelector: ".col-md-6",
                //     });
                // });
                // var $pubgrid = $(".publicaciones-wrapper").imagesLoaded(
                //     function () {
                //         $pubgrid.masonry({
                //             itemSelector: ".publicacion-item-medium",
                //         });
                //     }
                // );
                // var $attachedgrid = $(
                //     "div.attached-to-post.Miniaturas"
                // ).imagesLoaded(function () {
                //     $attachedgrid.masonry({
                //         itemSelector: ".attached-file-block",
                //     });
                // });
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
