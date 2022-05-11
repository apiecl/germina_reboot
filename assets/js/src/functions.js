//Google Font Loader

//Localized font string from functions.php = germina.fonts

WebFontConfig = {
    google: { families: germina.fonts },
    active: function () {
        var e = jQuery(".proyectos-home, .full-proylist");
        e.masonry("layout");
    },
};
(function () {
    var wf = document.createElement("script");
    wf.src = "https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js";
    wf.type = "text/javascript";
    wf.async = "true";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(wf, s);
})();

//Loader para proyectos

function germina_loadprojects(element) {
    var proyectlist = $("div.full-proylist");
    var proyectsPerPage = parseInt(germina.proyects_per_page);
    var linkitem = element;
    var termid = element.attr("data-term");
    var tax = element.attr("data-tax");
    var reuse = parseInt(element.attr("data-reuse"));
    var curOffset = 0;
    var taxtitle = $("h2.taxtitle");
    var loadmore = $("body button.loadmore");

    $(".proyect-call").removeClass("active");

    console.log(reuse);

    if (reuse !== 0) {
        var curOffset = proyectsPerPage * reuse;

        //añade un contador al data-reuse

        linkitem.attr("data-reuse", reuse + 1);
    } else {
        loadmore.attr("data-reuse", 1);
    }

    linkitem.append(
        ' <span class="loading-status"><i class="fa fa-spin fa-circle-o-notch"></i></span>'
    );

    $.ajax({
        url: germina.ajax_url,
        type: "post",
        data: {
            action: "germina_proyects_by_term",
            termid: termid,
            tax: tax,
            offset: curOffset,
        },
        success: function (response) {
            if (reuse === 0) {
                proyectlist.empty();
            }

            var content = JSON.parse(response);

            if (content.items !== undefined) {
                // var template = fetch(content["template"])
                // .then((response) => response.text())
                // .then((template) => {
                //     var rendered = Mustache.render(template, content);
                //     console.log(content.items);
                //     proyectlist.append(rendered);
                // });

                content.items.map((item) => {
                    if (item.post_thumbnail) {
                        proyectlist.append(`
                        <div class="col-md-12 proyect-items-wrapper">
                            <div class="proyect-item-medium animated zoomIn with-image">

                                <a class="block-item-link" href="${item.post_link}">

                                <div class="proyect-item-content-wrapper">
                                    <div class="proyect-item-meta-top">
                                        <span class="area">${item.post_area}</span>
                                        <i class="fa fa-angle-left"></i>
                                        <span class="fecha">${item.post_year}</span>
                                    </div>
                                    <h4>${item.post_title}</h4>
                                    <div class="proyect-item-meta-bottom">
                    
                                        <span class="temas">
                                            ${item.post_temas}
                                        </span>
                                    </div>
                                </div>
                                <img src="${item.post_thumbnail}" alt="${item.post_title}">
                                </a>
                            </div>
                        </div>
                        `);
                    } else {
                        proyectlist.append(`
                        <div class="col-md-12 proyect-items-wrapper">
                            <div class="proyect-item-medium animated zoomIn">

                                <a class="block-item-link" href="${item.post_link}">

                                <div class="proyect-item-content-wrapper">
                                    <div class="proyect-item-meta-top">
                                        <span class="area">${item.post_area}</span>
                                        <i class="fa fa-angle-left"></i>
                                        <span class="fecha">${item.post_year}</span>
                                    </div>
                                    <h4>${item.post_title}</h4>
                                    <div class="proyect-item-meta-bottom">
                    
                                        <span class="temas">
                                            ${item.post_temas}
                                        </span>
                                    </div>
                                </div>
                                </a>
                            </div>
                        </div>
                        `);
                    }
                });

                loadmore
                    .attr("data-term", content["term_id"])
                    .attr("data-tax", content["tax_slug"])
                    .removeClass("hidden")
                    .fadeIn();
            } else {
                proyectlist.append(
                    "<div class='col-md-12 proyect-items-wrapper'>No se encontraron contenidos</div>"
                );
            }

            $("span", linkitem).remove();

            //console.log(content);

            linkitem.addClass("active").removeClass("loading");

            //var html = Mustache.render( template, content);

            taxtitle.empty().append(content["taxname"]);

            //console.log(content, template);

            //proyectlist.append(html);

            $('div[data-id="proyect-nav"]').removeClass("active");
        },
        error: function (error) {
            console.log("Error:", error);
        },
    });
}
