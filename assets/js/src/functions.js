//Google Font Loader

//Localized font string from functions.php = germina.fonts

WebFontConfig = {
    google: { families: germina.fonts },
    active: function () {
        // var e = $(".archive.category-publicaciones .full-proylist.row");
        // var pre = $(".lastproys");
        // e.masonry("layout");
        // pre.masonry("layout");
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

function germina_loadprojects(element, $masonrygrid) {
    let proyectlist = $("div.full-proylist");
    let dateSorterAjax = $(".date-sorter-ajax");
    let selectedOrder = $(".panel-heading.active .ajax-sort-button").attr(
        "data-sort"
    );
    let sortButton = $(".ajax-sort-button");
    let proyectsPerPage = parseInt(germina.proyects_per_page);
    let linkitem = element;
    let termid = element.attr("data-term");
    let tax = element.attr("data-tax");
    let reuse = parseInt(element.attr("data-reuse"));
    let curOffset = 0;
    let taxtitle = $("h2.taxtitle");
    let loadmore = $("body button.loadmore");
    let itemtype = element.attr("data-type")
        ? element.attr("data-type")
        : "resumen-proyecto";
    let itemTemplate = element.attr("data-item-template")
        ? element.attr("data-item-template")
        : "item-medium";

    console.log(selectedOrder);

    $(".proyect-call").removeClass("active");

    //console.log(reuse);

    if (reuse !== 0) {
        curOffset = proyectsPerPage * reuse;
        //añade un contador al data-reuse
        loadmore.attr("data-reuse", reuse + 1);
    } else {
        loadmore.attr("data-reuse", 1);
    }

    linkitem.addClass("loadingbtn");
    //console.log("offset", curOffset);

    sortButton.attr({
        "data-term": termid,
        "data-offset": curOffset,
        "data-type": itemtype,
        "data-tax": tax,
        "data-item-template": itemTemplate,
    });

    $.ajax({
        url: germina.ajax_url,
        type: "POST",
        data: {
            action: "germina_proyects_by_term",
            termid: termid,
            tax: tax,
            offset: curOffset,
            itemtype: itemtype,
            order: selectedOrder,
        },
        success: function (response) {
            if (reuse === 0) {
                proyectlist.empty();
            }

            $(".filter-heading-toggle").click();
            dateSorterAjax.fadeIn();

            var content = JSON.parse(response);

            let projectCount = $("p.project-results-count");
            let itemlabel = projectCount.attr("data-item-plural");
            let itemlabelsingular = projectCount.attr("data-item-singular");
            let proyectItemMedium = (item) => {
                //console.log(item.format);
                return `                       
                            <div class="proyect-item-medium animated zoomIn ${
                                item.post_thumbnail && "with-image"
                            }">
                                <a class="block-item-link" href="${
                                    item.post_link
                                }" title="${item.post_title}">
                                <div class="proyect-item-content-wrapper">
                                    <h4>${item.post_title}</h4>
                                    <div class="proyect-item-meta-bottom">
                                        <div class="temas">
                                            <span>Temas:</span>
                                            ${item.post_temas}
                                        </div>
                                    </div>
                                </div>
                                ${
                                    item.post_thumbnail &&
                                    `<img src="${item.post_thumbnail}" alt="${item.post_title}">`
                                }
                                </a>
                            </div>             
                        `;
            };
            let documentItemMedium = (item) => {
                let icon = item.format.icon;
                return `<div class="document-item-medium zoomIn">
                <a class="block-item-link" href="${item.post_link}" title="${
                    item.post_title
                }">
                             ${
                                 item.doc_thumbnail
                                     ? `<img src="${item.doc_thumbnail}" alt="${item.post_title}">`
                                     : `<div class="icon-wrapper"><div><i class="${icon}"></i> ${item.format.content}</div></div>`
                             }

                    <h4>${item.post_title}</h4>    
                </a>
                </div>`;
            };

            if (content.items !== undefined) {
                //console.log(content);

                projectCount
                    .empty()
                    .append(
                        `<strong> ${content.total} ${
                            content.total > 1 ? itemlabel : itemlabelsingular
                        }</strong>`
                    );

                let elementsArr = [];
                content.items.map((item) => {
                    if (itemTemplate === "document") {
                        let element = documentItemMedium(item);
                        elementsArr.push(element);
                    } else {
                        proyectlist.append(
                            itemTemplate === "document"
                                ? documentItemMedium(item)
                                : proyectItemMedium(item)
                        );
                    }
                });

                if (itemTemplate == "document") {
                    proyectlist.masonry("destroy");
                    console.log("adding", elementsArr);
                    let $elements = $(elementsArr);
                    proyectlist.append(elementsArr).masonry();
                    proyectlist.masonry("layout");
                    proyectlist.imagesLoaded().progress(function () {
                        proyectlist.masonry("layout");
                    });
                    //$masonrygrid.append(elementsArr);
                    //$masonrygrid.masonry("layout");
                }

                //console.log("server offset", content.offset);
                if (content.isfinalquery === "remaining") {
                    loadmore
                        .attr("data-term", content["term_id"])
                        .attr("data-tax", content["tax_slug"])
                        .attr("data-type", itemtype)
                        .removeClass("hidden")
                        .fadeIn();
                }
            } else {
                projectCount.empty().append("0 " + itemlabel);
                proyectlist.append(
                    `<div class='col-md-12 proyect-items-wrapper'>
                        <div class="not-found-message">No se encontraron contenidos</div>
                    </div>`
                );
                $(".btn.loadmore").hide();
            }

            if (content.isfinalquery === "limit") {
                loadmore.hide();
            }

            linkitem.removeClass("loadingbtn");

            linkitem.addClass("active").removeClass("loading");

            taxtitle.empty().append(content["taxname"]);

            $('div[data-id="proyect-nav"]').removeClass("active");
        },
        error: function (error) {
            console.log("Error:", error);
        },
    });
}
