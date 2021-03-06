/*
 * Copyright 2016 poggit
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

console.info("Source code of Poggit: https://github.com/poggit/poggit");

String.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if(this.length === 0) return hash;
    for(i = 0, len = this.length; i < len; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

$(document).ready(function() {
    fixSize();
    $(window).resize(fixSize);
    $(".toggle").each(function() {
        var $this = $(this);
        var name = $this.attr("data-name");
        console.assert(name.length > 0);
        var children = $this.children();
        if(children.length == 0) {
            $this.append("<h3 class='wrapper-header'>" + name + "</h3>");
            return;
        }
        var wrapper = $("<div class='wrapper'></div>");
        wrapper.attr("id", "wrapper-of-" + name.hashCode());
        wrapper.css("display", "none");
        $this.wrapInner(wrapper);
        var header = $("<h3 class='wrapper-header'></h3>");
        header.text(name);
        header.append("&nbsp;&nbsp;");
        var img = $("<img title='Expand Arrow' width='24'>");
        img.attr("src", "https://maxcdn.icons8.com/Android_L/PNG/24/Arrows/expand_arrow-24.png");
        var clickListener = function() {
            var wrapper = $("#wrapper-of-" + name.hashCode());
            if(wrapper.css("display") == "none") {
                wrapper.css("display", "block");
                img.attr("src", "https://maxcdn.icons8.com/Android_L/PNG/24/Arrows/collapse_arrow-24.png");
            } else {
                wrapper.css("display", "none");
                img.attr("src", "https://maxcdn.icons8.com/Android_L/PNG/24/Arrows/expand_arrow-24.png");
            }
        };
        header.click(clickListener);
        header.append(img);
        $this.prepend(header);

        if($this.attr("data-opened") == "true") {
            clickListener();
        }
    });
    $(".navbutton").each(function() {
        var $this = $(this);
        var target = $this.attr("data-target");
        var ext;
        if(!(ext = $this.hasClass("extlink"))) {
            target = "${path.relativeRoot}" + target;
        }
        var wrapper = $("<a></a>");
        wrapper.addClass("navlink");
        wrapper.attr("href", target);
        if(ext) {
            wrapper.attr("target", "_blank");
        }
        $this.wrapInner(wrapper);
    })
});

function fixSize() {
    $("#body").css("top", $("#header").outerHeight());
}

function ajax(path, options) {
    $.post("${path.relativeRoot}csrf/" + path, {}, function(token) {
        if(options === undefined) {
            options = {};
        }
        if(options.dataType === undefined) {
            options.dataType = "json";
        }
        if(options.data === undefined) {
            options.data = {};
        }
        options.data.csrf = token;
        $.ajax("${path.relativeRoot}" + path, options);
    });
}

function login(scopes) {
    ajax("persistLoc", {
        data: {
            path: window.location.toString()
        },
        success: function() {
            var url = "https://github.com/login/oauth/authorize?client_id=${app.clientId}&state=${session.antiForge}&scope=";
            url += scopes.join(",");
            window.location = url;
        }
    });
}

function logout() {
    ajax("logout", {
        success: function() {
            window.location.reload(true);
        }
    });
}
