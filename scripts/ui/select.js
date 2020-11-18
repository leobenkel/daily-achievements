define([
    'jquery'
],
    function ($) {
        return function () {
            // https://www.w3schools.com/howto/howto_custom_select.asp
            // var x, i, j, l, ll, selElmnt, a, b, c;
            // x = document.getElementsByClassName("styled-select");
            // l = x.length;
            //
            // for (i = 0; i < l; i++) {
            //      selElmnt = x[i].getElementsByTagName("select")[0];
            //      ll = selElmnt.length;
            //      /* For each element, create a new DIV that will act as the selected item: */
            //      a = document.createElement("DIV");
            //      a.setAttribute("class", "select-selected");
            //      a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
            //      x[i].appendChild(a);
            //
            //      /* For each element, create a new DIV that will contain the option list: */
            //      b = document.createElement("DIV");
            //      b.setAttribute("class", "select-items select-hide");
            //      for (j = 1; j < ll; j++) {
            //          /* For each option in the original select element,
            //          create a new DIV that will act as an option item: */
            //          c = document.createElement("DIV");
            //          c.innerHTML = selElmnt.options[j].innerHTML;
            //          c.addEventListener("click", function (e) {
            //              /* When an item is clicked, update the original select box, and the selected item: */
            //              var y, i, k, s, h, sl, yl;
            //              s = this.parentNode.parentNode.getElementsByTagName("select")[0];
            //              sl = s.length;
            //              h = this.parentNode.previousSibling;
            //              for (i = 0; i < sl; i++) {
            //                    if (s.options[i].innerHTML == this.innerHTML) {
            //                     s.selectedIndex = i;
            //                     h.innerHTML = this.innerHTML;
            //                     y = this.parentNode.getElementsByClassName("same-as-selected");
            //                     yl = y.length;
            //                    for (k = 0; k < yl; k++) {
            //                        y[k].removeAttribute("class");
            //                    }
            //                    this.setAttribute("class", "same-as-selected");
            //                    break;
            //             }
            //         }
            //         h.click();
            //     });
            //     b.appendChild(c);
            // }
            // x[i].appendChild(b);
            // a.addEventListener("click", function (e) {
            //     /* When the select box is clicked, close any other select boxes,
            //     and open/close the current select box: */
            //     e.stopPropagation();
            //     closeAllSelect(this);
            //     this.nextSibling.classList.toggle("select-hide");
            //     this.classList.toggle("select-arrow-active");
            // });
            // }

            $('.styled-select')
                .filter(function (i, elem) {
                    let elements = $(elem).find('.select-selected');
                    return elements.length == 0;
                })
                .each(function (i, selContainerElmnt) {
                    let selContainer = $(selContainerElmnt)
                    let selElmnt = selContainer.find('select');
                    let options = selElmnt.find('option');

                    /* For each SELECT, create a new DIV that will act as the selected item: */
                    let optionSelected = options.filter(':selected');
                    let a = $('<div class="select-selected select-ui-extra"></div>');
                    a.html(optionSelected.html());
                    a.attr('data-valueOpt', optionSelected.val());


                    /* For each SELECT, create a new DIV that will contain the option list: */
                    let b = $('<div class="select-items select-hide select-ui-extra"></div>');
                    /* For each option in the original select element, create a new DIV that will act as an option item: */
                    options.each(function (i, opt) {
                        let o = $(opt);
                        let c = $('<div class="select-ui-extra"></div>');
                        c.html(o.html());
                        c.attr('data-valueOpt', o.val());

                        c.click(function () {
                            /* When an item is clicked, update the original select box, and the selected item: */
                            b.find('.same-as-selected').removeClass('same-as-selected');
                            let clickedOption = $(this);
                            let value = clickedOption.attr('data-valueOpt')
                            a.html(clickedOption.html());
                            a.attr('data-valueOpt',);
                            clickedOption.addClass('same-as-selected');
                            // options.prop('selected', false);
                            // options.filter(function (opt) {
                            //     return $(opt).val() == value;
                            // }).prop('selected', true);
                            selElmnt.val(value).change();
                            closeAllSelect();
                        });

                        b.append(c);
                    });

                    a.click(function (e) {
                        /* When the select box is clicked, close any other select boxes, and open/close the current select box: */
                        e.stopPropagation();
                        closeAllSelect(this);
                        selContainer.find('.select-arrow-active').removeClass('select-arrow-active');
                        selContainer.find('.select-hide').removeClass('select-hide');
                        return false;
                    });

                    selContainer.append(a);
                    selContainer.append(b);
                });

            let closeAllSelect = function (elmnt) {
                /* A function that will close all select boxes in the document,
                except the current select box: */
                // var x, y, i, xl, yl, arrNo = [];
                // x = document.getElementsByClassName("select-items");
                // y = document.getElementsByClassName("select-selected");
                // xl = x.length;
                // yl = y.length;
                // for (i = 0; i < yl; i++) {
                //     if (elmnt == y[i]) {
                //         arrNo.push(i)
                //     } else {
                //         y[i].classList.remove("select-arrow-active");
                //     }
                // }
                // for (i = 0; i < xl; i++) {
                //     if (arrNo.indexOf(i)) {
                //         x[i].classList.add("select-hide");
                //     }
                // }

                $('.select-selected')
                    .filter(function (i, e) {
                        return e != elmnt;
                    })
                    .removeClass('select-arrow-active');
                $('.select-items').addClass(['select-hide', 'select-arrow-active']);
            }

            /* If the user clicks anywhere outside the select box,
            then close all select boxes: */
            $(document).click(closeAllSelect);
        };
    });
