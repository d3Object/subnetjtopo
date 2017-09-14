/**
 * Created by yanbo on 2017/3/8
 * QQ 511948469
 * subnet 子网
 * server 服务器IP
 * app 业务/应用
 */
;
$(function() {
    // 定义mloadingDiv的宽高及其子元素
    $(".mloadingDiv").height(window.innerHeight);
    var _Top = window.innerHeight > 61 ? (window.innerHeight - 61) / 2 : 0,
        _Left = window.innerWidth > 215 ? (window.innerWidth - 215) / 2 : 0;
    $(".loadingDivChild").css({
        "left": _Left,
        "top": _Top
    });
    $(".mypanel").css("top", $(".navbar-logo").height());
    $(".mloadingDiv").removeClass("hide"); // 提示用户等待
    var flag = 0,tryErr = 0; // 此变量控制双击事件 切换非取与非钻取模式
    $.ajax({
        url: "/jtopo/getJtopoSys.do",
        data: {
            "kpi": $(".kpi").children("option:selected").val(),
            "start": 0,
            "end": 0,
            "span": 600
        },
        type: 'post',
        dataType: 'json',
        success: function(data) {
            var canvas = document.getElementById("canvas"), // 获取canvas
                canvasHeight = window.innerHeight - $(".navbar-logo").height(); // 设置canvas高度值
            $("#canvas").attr({
                "height": canvasHeight,
                "width": $(".navbar-logo").width()
            }); // 将宽高值赋给canvas
            var stage = new JTopo.Stage(canvas); // 创建一个舞台对象
            stage.wheelZoom = 1.2; // 设置鼠标缩放比例
            var scene = new JTopo.Scene(stage); // 创建一个场景对象
            scene.alpha = 1;
            scene.backgroundColor = "51, 71, 81";
            // 在空白处右键显示
            scene.addEventListener("mouseup", function(event) {
                if (event.target == null) {
                    if (event.button == 2) {
                        $("#linkmenu").hide();
                        $("#contextmenu").css({
                            top: event.pageY - 10,
                            left: event.pageX - 20
                        }).show().children("li:lt(3)").hide();
                    }
                }
            });
            function newNode(x, y, text, color) {
                var node = new JTopo.Node();
                node.setLocation(x, y);
                node.setSize(8, 8);
                node.radius = 4;
                node.layout = {
                    type: "circle",
                    radius: 160
                };
                node.fontColor = "218,218,218";
                node.font = "10px 微软雅黑";
                node.tip = text;
                node.fillColor = color;
                node.addEventListener('mouseup',
                    function(event) {
                        currentNode = this;
                        handler(event);
                    });
                node.mouseover(function(event) {
                    this.text = this.tip;
                });
                node.mouseout(function() {
                    this.text = null;
                });
                scene.add(node);
                return node;
            }
            function newCircleNode(x, y, text, color, alarmNum) {
                var node = new JTopo.CircleNode();
                node.setLocation(x, y);
                node.setSize(8, 8);
                node.radius = 4;
                node.layout = {
                    type: "circle",
                    radius: 160
                };
                node.fontColor = "255,255,255";
                node.font = "20px 微软雅黑 bloder";
                node.textPosition = "Top_Center";
                node.tip = text;
                node.alarmNum = alarmNum;
                node.fillColor = color;
                node.addEventListener('mouseup',
                    function(event) {
                        //监听鼠标松开事件
                        currentNode = this;
                        handler(event);
                        //console.log(this);
                        var nodeThis=this;
                        if(flag){
                            if(nodeThis.outLinks.length){
                                if(nodeThis.inLinks.length){
                                    nodeThis.outLinks.forEach(function(itemZ){
                                        if(itemZ.nodeZ.tip==nodeThis.portText){
                                            setTimeout(function(){
                                                if (nodeThis.x - nodeThis.inLinks[0].nodeA.x) {
                                                    itemZ.nodeZ.x = Math.abs((nodeThis.x - nodeThis.inLinks[0].nodeA.x) / 2) + Math.min(nodeThis.x, nodeThis.inLinks[0].nodeA.x);
                                                } else {
                                                    itemZ.nodeZ.x = nodeThis.x;
                                                }
                                                if (nodeThis.y - nodeThis.inLinks[0].nodeA.y) {
                                                    itemZ.nodeZ.y = Math.abs((nodeThis.y - nodeThis.inLinks[0].nodeA.y) / 2) +
                                                    Math.min(nodeThis.y, nodeThis.inLinks[0].nodeA.y);
                                                } else {
                                                    itemZ.nodeZ.y = nodeThis.y;
                                                }
                                            },10)
                                        }
                                    })
                                }
                            }
                        }
                    });
                node.mouseover(function(event) {
                    this.text = this.tip;
                    var tNode=this;
                });
                node.mouseout(function() {
                    this.text = null;
                });
                scene.add(node);
                return node;
            }
            function newLink(nodeA, nodeZ, text, dashedPattern) {
                var link = new JTopo.Link(nodeA, nodeZ);
                link.tip = text;
                // link.arrowsRadius = 3;
                link.lineWidth = 0.5;
                link.bundleOffset = 10;
                link.bundleGap = 10;
                link.strokeColor = '166,183,53';
                link.fontColor = "255,255,255";
                link.font = "20px 微软雅黑 bloder";
                link.textOffsetY = 3;
                link.addEventListener('mouseup', function(event) {
                    currentLink = this;
                    handlelink(event);
                }); // 线上的右键功能
                link.mouseover(function(event) {
                    this.text = this.tip;
                });
                link.mouseout(function() {
                    this.text = null;
                });
                scene.add(link);
                return link;
            }
            // 在node上右键
            function handler(event) {
                $("#linkmenu").hide();
                if (event.button == 2) { // 右键
                    // 当前位置弹出菜单（div）
                    $("#contextmenu").css({
                        top: event.pageY - 10,
                        left: event.pageX - 20
                    }).show().children("li").show();
                }
            }
            // 在连线上右键
            function handlelink(event) {
                $("#contextmenu").hide();
                if (event.button == 2) {
                    $("#linkmenu").css({
                        top: event.pageY - 10,
                        left: event.pageX - 20
                    }).show();
                }
            }
            var portal = {
                "showSname": function() {
                    // 加载用户保存的数据
                    $.ajax({
                        url: "/jtopo/getJtopoNames.do",
                        type: "post",
                        dataType: "json",
                        success: function(data) {
                            if (data.length) {
                                $(".qsave").removeClass("hide");
                                data.forEach(function(item) {
                                    $(".addOption").append($('<tr>' +
                                    '<td class="tdtext cursor">' + item.substr(13) + '</td>' +
                                    '<td class="Stime">' +
                                    '<span class="showTime">' + portal.fun.getLocaltime(item.substr(0, 13) / 1000) + '</span>' +
                                    '<span class="hideTime hide">' + item.substr(0, 13) + '</span></td>+' + '' +
                                    '<td data-toggle="tooltip" data-original-title="删除此行">' +
                                    '<i class="glyphicon glyphicon-remove removeli close "></i>' +
                                    '</td></tr>').on("click", function() {})).parent().addClass("hide");
                                    $(".qsave").removeClass("hide");
                                    $(".tdtext").click(function() {
                                        $("#myModal").modal('hide');
                                        var text = $(this).siblings(".Stime").children(".hideTime").text() + $(this).text();
                                        $(".mloadingDiv").removeClass("hide");
                                        $.ajax({
                                            url: "/jtopo/getJtopo.do",
                                            type: "post",
                                            data: {
                                                "name": text
                                            },
                                            dataType: "json",
                                            success: function(nodeJson) {
                                                portal.fun.tdtextClick(nodeJson);
                                            }
                                        });
                                        setTimeout(function() {
                                            $(".mloadingDiv").addClass("hide");
                                        }, 600);
                                    });
                                    //用户删除保存数据
                                    $(".removeli").click(function() {
                                        var close = $(this);
                                        $.ajax({
                                            url: "/jtopo/delJtopo.do",
                                            type: "post",
                                            data: {
                                                name: close.parent().siblings(".Stime").children(".hideTime").text() + close.parent().siblings(".tdtext").text()
                                            },
                                            dataType: "json",
                                            success: function(what) {
                                                if (what) {
                                                    close.parent().parent().remove();
                                                    $(".t-click").click(function() {
                                                        if ($(".addOption").children().length == 1) {
                                                            $(".qsave").addClass("hide");
                                                        }
                                                    })
                                                }
                                            }
                                        });
                                    });
                                })
                            }
                        }
                    });
                },
                "tool": {
                    "homeNode": function(data) {
                        /*
                         * 首次展示在页面的IP点连线及其功能逻辑：
                         * 1、先把from_ip从data里面取出来去重并存进tempArry数组中
                         * 2、再把to_info从data里面取出来去重并存进tempArry数组中
                         * 所有点的IP信息均放在咯tempArry数组中 点与点的连接关系是默认左边点为中心点
                         * 在当前数据中会大量的存在 此点既是中心点又是别的中心点的子点 这里我默认把from_ip做为中心点
                         * to_info做为中心点的子点 3、同时把from_ip to_info与tempArry进行比较
                         * 得到一个tempArry里面的下标集合存进leftArry和rightArry中
                         * leftArry与rightArry中的下标是一一对应的关系 4、关键的一步骤。把这两个数组给关联起来
                         * 也是难点这个点如果处理不好直接引影页面的美观 如果再能处理得好第3个步骤就能把这给完美处理咯
                         *
                         */
                        var tempArry = [], // 所有的IP的集合
                            nodeArry = [], // 所有页面中的点的集合
                            leftArry = [], // 基于IP集合的下标集合
                            rightArry = []; // 基于IP集合的下标集合
                        // 去重 所有的IP的集合
                        $.each(data, function(i, v) {
                            if (tempArry.indexOf(v.from_ip) == -1) {
                                tempArry.push(v.from_ip);
                            }
                            if (tempArry.indexOf(v.to_info) == -1) {
                                tempArry.push(v.to_info);
                            }
                        });
                        // 确定起始点
                        $.each(data, function(i, v) {
                            for (var j = 0; j < tempArry.length; j++) {
                                if (data[i].from_ip == tempArry[j]) {
                                    leftArry.push(j);
                                }
                                if (data[i].to_info == tempArry[j]) {
                                    rightArry.push(j);
                                }
                            }
                        });
                        // 画点tempArry
                        $.each(tempArry, function(i, v) {
                            var x = Math.random() * parseInt(window.innerWidth * 0.6) +
                                parseInt(window.innerWidth * 0.2);
                            var y = Math.random() * parseInt((window.innerHeight - $(".navbar-logo").height() - 20) * 0.6) +
                                parseInt((window.innerHeight - $(".navbar-logo ").height() - 20) * 0.2);
                            for (var j = 0; j < data.length; j++) {
                                if (v == data[j].from_ip) {
                                    if (data[j].from_type == "subnet") {
                                        var color = "255,255,0";
                                    } else if (data[j].from_type == "server"
                                        ||data[j].from_type == "web"
                                        ||data[j].from_type == "costomer") {
                                        var color = "7,237,15";
                                    } else {
                                        var color = "223,227,219";
                                    }
                                    var alarmNum = data[j].from_alarm;
                                } else if (v == data[j].to_info) {
                                    if (data[j].to_type == "subnet") {
                                        var color = "255,255,0";
                                    } else if (data[j].to_type == "server"||
                                        data[j].to_type == "web"
                                        ||data[j].to_type == "costomer") {
                                        var color = "7,237,15";
                                    } else {
                                        var color = "223,227,219";
                                    }
                                    var alarmNum = data[j].to_alarm;
                                }
                            }
                            if(alarmNum){
                                console.log(alarmNum);
                            }
                            var a = newCircleNode(x, y, v, color,alarmNum);
                            if(a.tip.indexOf("/")!=-1){
                                for(var k=0;k<data.length;k++){
                                    if(a.tip==data[k].from_ip){
                                        if(a.relAy){
                                            if(a.relAy[data[k].real_ip]){
                                                if(a.relAy[data[k].real_ip].indexOf(data[k].to_info)==-1){
                                                    a.relAy[data[k].real_ip].push(data[k].to_info);
                                                }
                                            }else{
                                                a.relAy[data[k].real_ip] = [];
                                                a.relAy[data[k].real_ip].push(data[k].to_info);
                                            }
                                        }else{
                                            a.relAy=[];
                                            a.relAy[data[k].real_ip] = [];
                                            a.relAy[data[k].real_ip].push(data[k].to_info);
                                        }
                                    }else if(a.tip==data[k].to_info){
                                        if(a.relAy){
                                            if(a.relAy[data[k].real_ip]){
                                                if(a.relAy[data[k].real_ip].indexOf(data[k].from_ip)==-1){
                                                    a.relAy[data[k].real_ip].push(data[k].from_ip);
                                                }
                                            }else{
                                                a.relAy[data[k].real_ip] = [];
                                                a.relAy[data[k].real_ip].push(data[k].from_ip);
                                            }
                                        }else{
                                            a.relAy=[];
                                            a.relAy[data[k].real_ip] = [];
                                            a.relAy[data[k].real_ip].push(data[k].from_ip);
                                        }
                                    }
                                }
                            }
                            // 展示alarm告警
                            portal.Jnode.alarm(a, a.alarmNum);
                            if ($(".showIp").text() == "取消显示IP") {
                                a.text = a.tip;
                                a.mouseout(function() {
                                    this.text = this.tip;
                                });
                            } else {
                                a.text = null;
                                a.mouseout(function() {
                                    this.text = null;
                                });
                            }
                            nodeArry.push(a);
                        });
                        // 连线
                        for (var i = 0; i < data.length; i++) {
                            var ilink = newLink(nodeArry[leftArry[i]], nodeArry[rightArry[i]]);
                            // 此处应该判断KPI为啥值
                            portal.Jnode.linkValue($(".kpi").children("option:selected").val(),
                                data[i].value, ilink);
                            try {
                                JTopo.layout.layoutNode(scene, nodeArry[leftArry[i]], true);
                            }catch (err){
                                console.log(err);
                                console.log(i);
                                tryErr = 1;
                                $("button[name='center']").addClass("hide");
                                $("button[name='save']").addClass("hide");
                                $("button[name='export_image']").addClass("hide");
                            }finally {
                            }
                        }
                        // 让子点随中心点移动
                        scene.addEventListener('mouseup', function(e) {
                            if (e.target && e.target.layout) {
                                JTopo.layout.layoutNode(scene, e.target, true);
                            }
                        });
                        setTimeout(function() {
                            $(".mloadingDiv").addClass("hide");
                        }, 200); // 关闭提示功能
                    },
                    "selectMode": function() {
                        // 框选模式selectMode
                        var changeMode = $(".sselect").parent().attr("data-original-title");
                        if(changeMode != "框选模式"){
                            stage.mode = "normal";
                            $(".sselect").parent().attr("data-original-title", "框选模式");
                        }else {
                            stage.mode = "select";
                            $(".sselect").parent().attr("data-original-title", "退出框选模式");
                        }
                    },
                    "showCenter": function() {
                        // 缩放并居中显示
                        stage.centerAndZoom();
                    },
                    "exportImg": function(stage) {
                        stage.saveImageInfo();
                    },
                    "fullScreen": function(canvas) {
                        // 全屏显示 fullScreen()
                        if (canvas.requestFullscreen) {
                            canvas.requestFullscreen();
                        } else if (canvas.msRequestFullscreen) {
                            canvas.msRequestFullscreen();
                        } else if (canvas.mozRequestFullScreen) {
                            canvas.mozRequestFullScreen();
                        } else if (canvas.webkitRequestFullScreen) {
                            canvas.webkitRequestFullScreen();
                        }
                    },
                    "saveNode": function() {
                        if(flag){
                            var userSaveJson = prompt("请为你所保存的状态命名,命名长度不得超过7个汉字或字母或数字,不建议使用特殊字符以免保存失败");
                            /*     $(".modal-body-div").addClass("hide");
                             $(".addOption").parent().addClass("hide");
                             $(".modal-tipUser").removeClass("hide").children(".namedtext").val("");
                             $("#myModal").modal('show');
                             setTimeout(function(){
                             $(".namedtext").focus();
                             },600)*/
                            /*   $(".t-click").click(function(){
                             $("#myModal").modal('hide');
                             var userSaveJson = $(".namedtext").val();
                             })*/
                            if (userSaveJson) {
                                if (userSaveJson.length > 7) {
                                    alert("名字超长，请重新命名保存。。");
                                    /*      $("#myModal").modal('hide');
                                     setTimeout(function() {
                                     $(".t-click").attr("disabled","disabled").show();
                                     $(".addOption").parent().addClass("hide");
                                     $(".modal-tipUser").addClass("hide");
                                     $(".modal-body-div").removeClass("hide").text("名字超长，请重新命名保存,2秒后自动关闭");
                                     $(".f-click").show();
                                     $("#myModal").modal('show');
                                     /!*   $(".t-click").click(function() {
                                     $("#myModal").modal('hide');
                                     })*!/
                                     setTimeout(function(){
                                     $("#myModal").modal('hide');
                                     $(".t-click").removeAttr("disabled");
                                     },5000)
                                     }, 700);*/
                                } else {
                                    var saveJson = "[",
                                        time = new Date().getTime();
                                    saveJson += "{\"flag\":" + '"' + flag + '"' + "},";
                                    scene.childs.forEach(function(item, index, array) {
                                        saveJson += "{";
                                        if (item.elementType == "node") {
                                            item.id = index; // 解决源码id重复的问题
                                            if (item.snodeArry) {
                                                saveJson += "\"elementType\":" + '"' + item.elementType + '"';
                                                saveJson += ",\"id\":" + '"' + item.id + '"';
                                                saveJson += ",\"x\":" + '"' + item.x + '"';
                                                saveJson += ",\"y\":" + '"' + item.y + '"';
                                                saveJson += ",\"fillColor\":" + '"' + item.fillColor + '"';
                                                saveJson += ",\"tip\":" + '"' + item.tip + '"';
                                                saveJson += ",\"radius\":" + '"' + item.radius + '"';
                                                saveJson += ",\"snodeArry\":" + "[";
                                                item.snodeArry.forEach(function(itmf, findx) {
                                                    saveJson += "{";
                                                    saveJson += "\"tip\":" + '"' + itmf.tip + '"';
                                                    saveJson += ",\"radius\":" + '"' + itmf.radius + '"';
                                                    saveJson += ",\"fillColor\":" + '"' + itmf.fillColor + '"';
                                                    saveJson += ",\"x\":" + '"' + itmf.x + '"';
                                                    saveJson += ",\"y\":" + '"' + itmf.y + '"';
                                                    saveJson += ",\"alarmNum\":" + '"' + itmf.alarmNum + '"';
                                                    if (itmf.nodeInlinks.length) {
                                                        saveJson += ",\"inLinks\":" + "[";
                                                        itmf.nodeInlinks.forEach(function(flink, flindex) {
                                                            saveJson += "{";
                                                            saveJson += "\"strokeColor\":" + '"' + flink.strokeColor + '"';
                                                            saveJson += ",\"tip\":" + '"' + flink.tip + '"';
                                                            saveJson += ",\"tiptext\":" + '"' + flink.tiptext + '"';
                                                            saveJson += ",\"nodeAtip\":" + '"' + flink.nodeA.tip + '"';
                                                            saveJson += "},";
                                                        });
                                                        saveJson = saveJson.substring(0, saveJson.length - 1); // 去掉最后的逗号
                                                        saveJson += "]";
                                                    }
                                                    if (itmf.nodeOutlinks.length) {
                                                        saveJson += ",\"outLinks\":" + "[";
                                                        itmf.nodeOutlinks.forEach(function(flink, flindex) {
                                                            saveJson += "{";
                                                            saveJson += "\"strokeColor\":" + '"' + flink.strokeColor + '"';
                                                            saveJson += ",\"tip\":" + '"' + flink.tip + '"';
                                                            saveJson += ",\"tiptext\":" + '"' + flink.tiptext + '"';
                                                            saveJson += ",\"nodeZtip\":" + '"' + flink.nodeZ.tip + '"';
                                                            saveJson += "},";
                                                        });
                                                        saveJson = saveJson.substring(0, saveJson.length - 1); // 去掉最后的逗号
                                                        saveJson += "]";
                                                    }
                                                    saveJson += "},";
                                                });
                                                saveJson = saveJson.substring(0, saveJson.length - 1); // 去掉最后的逗号
                                                saveJson += "]";
                                            } else {
                                                saveJson += "\"elementType\":" + '"' + item.elementType + '"';
                                                saveJson += ",\"id\":" + '"' + item.id + '"';
                                                saveJson += ",\"x\":" + '"' + item.x + '"';
                                                saveJson += ",\"y\":" + '"' + item.y + '"';
                                                saveJson += ",\"alarmNum\":" + '"' + item.alarmNum + '"';
                                                saveJson += ",\"fillColor\":" + '"' + item.fillColor + '"';
                                                saveJson += ",\"tip\":" + '"' + item.tip + '"';
                                                saveJson += ",\"radius\":" + '"' + item.radius + '"';
                                                saveJson += ",\"relAy\":" + '"' + item.relAy + '"';
                                                saveJson += ",\"portText\":" + '"' + item.portText + '"';
                                            }
                                        } else if (item.elementType == "link") {
                                            item.id = "link-" + index; // 解决源码id重复的问题
                                            saveJson += "\"elementType\":" + '"' + item.elementType + '"';
                                            saveJson += ",\"nodeAid\":" + '"' + item.nodeA.id + '"';
                                            saveJson += ",\"nodeZid\":" + '"' + item.nodeZ.id + '"';
                                            saveJson += ",\"lineWidth\":" + '"' + item.lineWidth + '"';
                                            saveJson += ",\"tip\":" + '"' + item.tip + '"';
                                            saveJson += ",\"strokeColor\":" + '"' + item.strokeColor + '"';
                                            saveJson += ",\"tiptext\":" + '"' + item.tiptext + '"';
                                        }
                                        saveJson += "},";
                                    });
                                    saveJson = saveJson.substring(0, saveJson.length - 1); // 去掉最后的逗号
                                    saveJson += "]";
                                    $.ajax({
                                        url: "/jtopo/saveJtopo.do",
                                        type: "post",
                                        data: {
                                            "nodeJson": saveJson,
                                            "name": time + userSaveJson
                                        },
                                        dataType: "json",
                                        success: function(sdata) {
                                            if (sdata) {
                                                $(".addOption").append($('<tr>' +
                                                '<td class="tdtext cursor">' + userSaveJson + '</td>' +
                                                '<td class="Stime">' +
                                                '<span class="showTime">' + portal.fun.getLocaltime(time / 1000) + '</span>' +
                                                '<span class="hideTime hide">' + time + '</span></td>+' + '' +
                                                '<td data-toggle="tooltip" data-original-title="删除此行">' +
                                                '<i class="glyphicon glyphicon-remove removeli close"></i>' +
                                                '</td></tr>').on("click", function() {})).parent().addClass("hide");
                                                $(".qsave").removeClass("hide");
                                                // 重新渲染用户保存的状态
                                                $(".tdtext").click(function() {
                                                    $("#myModal").modal('hide');
                                                    var text = $(this).siblings(".Stime").children(".hideTime").text() + $(this).text();
                                                    $(".mloadingDiv").removeClass("hide");
                                                    $.ajax({
                                                        url: "/jtopo/getJtopo.do",
                                                        type: "post",
                                                        data: {
                                                            "name": text
                                                        },
                                                        dataType: "json",
                                                        success: function(nodeJson) {
                                                            portal.fun.tdtextClick(nodeJson);
                                                        }
                                                    });
                                                    setTimeout(function() {
                                                            $(".mloadingDiv").addClass("hide");
                                                        },
                                                        600);
                                                });
                                                $(".removeli").click(function() {
                                                    var close = $(this);
                                                    $.ajax({
                                                        url: "/jtopo/delJtopo.do",
                                                        type: "post",
                                                        data: {
                                                            name: close.parent().siblings(".Stime").children(".hideTime").text() + close.parent().siblings(".tdtext").text()
                                                        },
                                                        dataType: "json",
                                                        success: function(what) {
                                                            if (what) {
                                                                close.parent().parent().remove();
                                                                $(".t-click").click(function() {
                                                                    if ($(".addOption").children().length == 1) {
                                                                        $(".qsave").addClass("hide");
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    });
                                                });
                                                $(".addOption").parent().addClass("hide");
                                                $(".modal-tipUser").addClass("hide");
                                                $(".modal-body-div").text("保存成功").removeClass("hide");
                                                $(".f-click").hide();
                                                $("#myModal").modal('show');
                                            } else {
                                                $(".addOption").parent().addClass("hide");
                                                $(".modal-tipUser").addClass("hide");
                                                $(".modal-body-div").text("保存失败，请您稍后再试").removeClass("hide");
                                                $(".f-click").hide();
                                                $("#myModal").modal('show');
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    },
                    "toggleIptext": {
                        "showIptext": function() {
                            // 显示IP
                            scene.childs.forEach(function(item, index) {
                                if (item.elementType == "node") {
                                    item.text = item.tip;
                                    item.mouseout(function() {
                                        this.text = this.tip;
                                    });
                                }
                            });
                            $(".showIp").text("取消显示IP");
                        },
                        "hideIptext": function() {
                            scene.childs.forEach(function(item, index) {
                                if (item.elementType == "node") {
                                    item.text = null;
                                    item.mouseout(function() {
                                        this.text = null;
                                    });
                                }
                            });
                            $(".showIp").text("显示IP地址");
                        }
                    },
                    "IPmerge": {
                        "reset_rest_from4": function(cform) {
                            cform.bcast_1.value = "";
                            cform.bcast_2.value = "";
                            cform.bcast_3.value = "";
                            cform.bcast_4.value = "";
                            //
                            cform.nwadr_1.value = "";
                            cform.nwadr_2.value = "";
                            cform.nwadr_3.value = "";
                            cform.nwadr_4.value = "";
                            //
                            cform.firstadr_1.value = "";
                            cform.firstadr_2.value = "";
                            cform.firstadr_3.value = "";
                            cform.firstadr_4.value = "";
                            //
                            cform.lastadr_1.value = "";
                            cform.lastadr_2.value = "";
                            cform.lastadr_3.value = "";
                            cform.lastadr_4.value = "";
                            //
                            cform.snm_1.value = "";
                            cform.snm_2.value = "";
                            cform.snm_3.value = "";
                            cform.snm_4.value = "";
                            //
                            cform.numofaddr.value = "";
                        },
                        "calNBFL": function(cform) {
                            var rt = 0;
                            portal.tool.IPmerge.reset_rest_from4(cform);
                            tmpvar = parseInt(cform.ip_1.value, 10);
                            if (isNaN(tmpvar) || tmpvar > 255 || tmpvar < 0) {
                                cform.numofaddr.value = '错误';
                                return (1);
                            }
                            tmpvar = parseInt(cform.ip_2.value, 10);
                            if (isNaN(tmpvar) || tmpvar > 255 || tmpvar < 0) {
                                cform.numofaddr.value = '错误';
                                return (1);
                            }
                            tmpvar = parseInt(cform.ip_3.value, 10);
                            if (isNaN(tmpvar) || tmpvar > 255 || tmpvar < 0) {
                                cform.numofaddr.value = '错误';
                                return (1);
                            }
                            tmpvar = parseInt(cform.ip_4.value, 10);
                            if (isNaN(tmpvar) || tmpvar > 255 || tmpvar < 0) {
                                cform.numofaddr.value = '错误';
                                return (1);
                            }
                            rt = portal.tool.IPmerge.calcNWmask(cform);
                            if (rt != 0) {
                                // error
                                return (1);
                            }
                            tmpvar = parseInt(cform.bits.value, 10);
                            if (tmpvar < 0) {
                                cform.numofaddr.value = '错误';
                                return (1);
                            }
                            if (tmpvar > 32) {
                                cform.numofaddr.value = '错误';
                                return (1);
                            }
                            if (tmpvar == 31) {
                                cform.numofaddr.value = "two hosts";
                                cform.firstadr_1.value = cform.ip_1.value & cform.snm_1.value;
                                cform.firstadr_2.value = cform.ip_2.value & cform.snm_2.value;
                                cform.firstadr_3.value = cform.ip_3.value & cform.snm_3.value;
                                cform.firstadr_4.value = cform.ip_4.value & cform.snm_4.value;
                                //
                                cform.lastadr_1.value = cform.ip_1.value | (~cform.snm_1.value & 0xff);
                                cform.lastadr_2.value = cform.ip_2.value | (~cform.snm_2.value & 0xff);
                                cform.lastadr_3.value = cform.ip_3.value | (~cform.snm_3.value & 0xff);
                                cform.lastadr_4.value = cform.ip_4.value | (~cform.snm_4.value & 0xff);
                                return (1);
                            }
                            if (tmpvar == 32) {
                                cform.numofaddr.value = "one host";
                                cform.firstadr_1.value = cform.ip_1.value;
                                cform.firstadr_2.value = cform.ip_2.value;
                                cform.firstadr_3.value = cform.ip_3.value;
                                cform.firstadr_4.value = cform.ip_4.value;
                                return (1);
                            }
                            cform.numofaddr.value = Math.pow(2, 32 - tmpvar) - 2;
                            //
                            cform.bcast_1.value = cform.ip_1.value | (~cform.snm_1.value & 0xff);
                            cform.bcast_2.value = cform.ip_2.value | (~cform.snm_2.value & 0xff);
                            cform.bcast_3.value = cform.ip_3.value | (~cform.snm_3.value & 0xff);
                            cform.bcast_4.value = cform.ip_4.value | (~cform.snm_4.value & 0xff);
                            //
                            cform.nwadr_1.value = cform.ip_1.value & cform.snm_1.value;
                            cform.nwadr_2.value = cform.ip_2.value & cform.snm_2.value;
                            cform.nwadr_3.value = cform.ip_3.value & cform.snm_3.value;
                            cform.nwadr_4.value = cform.ip_4.value & cform.snm_4.value;
                            //
                            cform.firstadr_1.value = cform.nwadr_1.value;
                            cform.firstadr_2.value = cform.nwadr_2.value;
                            cform.firstadr_3.value = cform.nwadr_3.value;
                            cform.firstadr_4.value = parseInt(cform.nwadr_4.value) + 1;
                            //
                            cform.lastadr_1.value = cform.bcast_1.value;
                            cform.lastadr_2.value = cform.bcast_2.value;
                            cform.lastadr_3.value = cform.bcast_3.value;
                            cform.lastadr_4.value = parseInt(cform.bcast_4.value) - 1;
                            return (0);
                        },
                        "calcNWmask": function(cform) {
                            tmpvar = parseInt(cform.bits.value, 10);
                            if (isNaN(tmpvar) || tmpvar > 32 || tmpvar < 0) {
                                cform.snm_1.value = '错误';
                                cform.snm_2.value = "";
                                cform.snm_3.value = "";
                                cform.snm_4.value = "";
                                return (1);
                            }
                            cform.snm_1.value = 0;
                            cform.snm_2.value = 0;
                            cform.snm_3.value = 0;
                            cform.snm_4.value = 0;
                            if (tmpvar >= 8) {
                                cform.snm_1.value = 255;
                                tmpvar -= 8;
                            } else {
                                cform.snm_1.value = portal.tool.IPmerge.h_fillbitsfromleft(tmpvar);
                                return (0);
                            }
                            if (tmpvar >= 8) {
                                cform.snm_2.value = 255;
                                tmpvar -= 8;
                            } else {
                                cform.snm_2.value = portal.tool.IPmerge.h_fillbitsfromleft(tmpvar);
                                return (0);
                            }
                            if (tmpvar >= 8) {
                                cform.snm_3.value = 255;
                                tmpvar -= 8;
                            } else {
                                cform.snm_3.value = portal.tool.IPmerge.h_fillbitsfromleft(tmpvar);
                                return (0);
                            }
                            cform.snm_4.value = portal.tool.IPmerge.h_fillbitsfromleft(tmpvar);
                            return (0);
                        },
                        "h_fillbitsfromleft": function(num) {
                            if (num >= 8) {
                                return (255);
                            }
                            bitpat = 0xff00;
                            while (num > 0) {
                                bitpat = bitpat >> 1;
                                num--;
                            }
                            return (bitpat & 0xff);
                        }
                    },
                    "help": function() {
                        // 产品说明
                        $(".modal-title").text("产品说明");
                        /*      "<li>" + "本产品中每个非中心点都围绕着中心点进行展示，若拖动非中心点，则" +
                         "中心点不会改变位置,若拖动中心点，则非中心点会跟着位移。" +
                         +"当在右上角输入框输入IP" +
                         "地址进行钻取时，进入钻取状态，双击该点本产品会对IP进行由IP到PORT到IP到PORT的通信关系进行梳理。" +"</li>" +*/
                        var tuli = "<ul>" +
                            "<li>" + "为了获得好的体验效果请务必使用谷歌内核浏览器浏览本产品,万分感谢!" + "</li>" +
                            "<li>" +"导航栏：" +"</li>" +
                            "<li>" +"下拉框：可根据您的选择重新渲染页面的对应KPI值" +"</li>" +
                            "<li>" +"查询：在输入框输入IP进行查询可找到当前页面的所有IP;支持模糊查找;如输入“90”;找到“192.190.1.20”;" +
                            "若查询的是某个网段的某个IP则建议输入前三位即可;如输入“192.168.1”找到“192.168.1.1/24”" +"</li>" +
                            "<li>" +"告警提示：可切换是否显示告警(默认显示告警)" +"</li>" +
                            "<li>" +"工具栏" +"</li>" +
                            "<li>" +"初始状态：可回到进入此页面初始的画面" +"</li>" +
                            "<li>" +"框选/退出框选模式：不能拖个整个画布;只能对IP点进行多个或选择的多个进行拖动或可选把多个进行删除操作" +"</li>" +
                            "<li>" +"居中显示：可将整个IP进行自动缩放并居中显示" +"</li>" +
                            "<li>" +"全屏显示：当点击这个功能入口会启用浏览器的全屏模式显示画布;" +"</li>" +
                            "<li>" +"保存状态：可将页面中的点保存起来;" +"</li>" +
                            "<li>" +"请求保存：可将上次的保存重新渲染在页面;" +"</li>" +
                            "<li>" +"显示/取消IP：将所有的IP文字显示/取消显示在画布；" + "</li>" +
                            "<li>" +"导出PNG:将画布上所有的对象生成PNG图片并在浏览器另一窗口打开；" +"</li>" +
                            "<li>" +"匹配用户设置:可将您设置的网段在此页面进行聚合" +"</li>" +
                            "<li>" +"在空白处右键：" +"</li>" +
                            "<li>" +"隐藏/显示工具栏：可对工具栏进行隐藏显示操作" +"</li>" +
                            "<li>" +"在IP点上右键：" +"</li>" +
                            "<li>" +"复制当前对象IP：会出现一个输入框;需要ctrl+A、ctrl+C进行复制;" +"</li>" +
                            "<li>" +"以此为中心显示：当一个点与多个点相连时;中心点却不是此点;可进行此操作对当前页面进行重新渲染;" +"</li>" +
                            "<li>" +"删除对象：可对当前对象或选中为高亮状态的对象进行删除(通过鼠标右键或键盘DELETE键);" +"</li>" +
                            "<li>" + "在连线上右键：" +"</li>" +
                            "<li>" +"修改颜色（随机）：可随机更改连线的颜色 ；" +"</li>" +
                            "<li>" +"连线加粗：每点击一次连线加粗1个单位；" +"</li>" +
                            "<li>" +"连线变细：每点击一次连线减细1个单位，直到小于1则不再减小；" +"</li>" +
                            "<li>" +"变成虚线：将连线变成虚线；" +"</li>" +
                            "<li>" + "变成实线：将连线变成实线；" + "</li>" +
                            "</ul>";
                        $(".modal-body-div").html(tuli).removeClass("hide");
                        $(".addOption").parent().addClass("hide");
                        $(".f-click").hide();
                        $("#myModal").modal('show');
                    }
                },
                "Rclick": {
                    "delNode": function() {
                        var selectAllNode = [];
                        for (var i = 0; i < scene.childs.length; i++) {
                            if (scene.childs[i].elementType == "node") {
                                if (scene.childs[i].selected == true) {
                                    selectAllNode.push(scene.childs[i]);
                                }
                            }
                        }
                        if (selectAllNode.length != 0) {
                            $(".modal-title").text("操作框");
                            $(".addOption").parent().addClass("hide");
                            $(".modal-body-div").text("执行删除" + selectAllNode.length + "个节点且不可恢复，确定要这样操作吗？")
                                .removeClass("hide");
                            $(".f-click").show();
                            $("#myModal").modal('show');
                            $(".t-click").click(function() {
                                for (var i = 0; i < selectAllNode.length; i++) {
                                    scene.remove(selectAllNode[i]);
                                }
                            });
                        } else {
                            $(".modal-title").text("操作框");
                            $(".addOption").parent().addClass("hide");
                            $(".modal-body-div").text("您已经选择了0个对象，无法执行删除操作").removeClass("hide");
                            $(".f-click").hide();
                            $(" #myModal").modal('show');
                        }
                    },
                    "copyNodetext": function() {
                        var textfield = $("#jtopo_textfield");
                        if (currentNode.tip == null) return;
                        var e = currentNode.tip;
                        textfield.css({
                            top: event.pageY - 10,
                            left: event.pageX - 100
                        }).show().focus().select().val(e);
                        e.text = "";
                        textfield[0].JTopoNode = e;
                        $("#jtopo_textfield").blur(function() {
                            textfield.hide().val();
                        }).keypress(function(e) {
                            var key = e.which; // e.which是按键的值
                            if (key == 13) {
                                $(this).blur();
                            }
                        });
                    },
                    "showthisNodeCenter": function() {
                        /*
                         * 思路： 1、获取该点的tip 2、获取当前页面与之相连线的点、、、这是难点、、如何获取
                         * 3、去除与之相关连的点的边线。。 4、以此点为中心点，把与之相关联的点重新连线
                         */
                        // 在inLinks集合中是从nodeA连接到nodeZ的后者为本点
                        // 在outLinks则相反
                        // console.log("currentNode.cx:"+currentNode.cx);
                        // 此处应该还有更好的方法
                        $(".mloadingDiv").removeClass("hide");
                        setTimeout(function() {
                            var nodeAarry = [],
                                linkArry = [];
                            if (currentNode.inLinks.length != 0) {
                                for (var i = 0; i < currentNode.inLinks.length; i++) {
                                    if (nodeAarry.indexOf(currentNode.inLinks[i].nodeA) == -1) {
                                        nodeAarry.push(currentNode.inLinks[i].nodeA);
                                    }
                                    if (linkArry.indexOf(currentNode.inLinks[i]) == -1) {
                                        linkArry.push(currentNode.inLinks[i]);
                                    }
                                }
                            }
                            if (currentNode.outLinks.length != 0) {
                                for (var i = 0; i < currentNode.outLinks.length; i++) {
                                    if (nodeAarry.indexOf(currentNode.outLinks[i].nodeZ) == -1) {
                                        nodeAarry.push(currentNode.outLinks[i].nodeZ);
                                    }
                                    if (linkArry.indexOf(currentNode.outLinks[i]) == -1) {
                                        linkArry.push(currentNode.outLinks[i]);
                                    }
                                }
                            }
                            for (var i = 0; i < linkArry.length; i++) {
                                scene.remove(linkArry[i]);
                            }
                            for (var i = 0; i < nodeAarry.length; i++) {
                                newLink(currentNode, nodeAarry[i]);
                                JTopo.layout.layoutNode(scene, currentNode, true);
                            }
                            $(".mloadingDiv").removeClass("hide");
                            var thisOption = $(".kpi").children("option:selected").val();
                            $.ajax({
                                url: "/jtopo/getJtopoSys.do",
                                type: "post",
                                data: {
                                    "kpi": thisOption,
                                    "start": 0,
                                    "end": 0,
                                    "lidu": 600
                                },
                                dataType: "json",
                                success: function(system) {
                                    portal.Jnode.linkedVal(thisOption, system);
                                    $(".mloadingDiv").addClass("hide");
                                }
                            })
                        }, 600);
                        setTimeout(function() {
                            $(".mloadingDiv").addClass("hide");
                        }, 600);
                    },
                    "selectAll": function() {
                        for (var i = 0; i < scene.childs.length; i++) {
                            if (scene.childs[i].elementType == "node") {
                                scene.childs[i].selected = true;
                            }
                        }
                    },
                    "selectNotselectednode": function() {
                        for (var i = 0; i < scene.childs.length; i++) {
                            if (scene.childs[i].elementType == "node") {
                                if (scene.childs[i].selected == true) {
                                    scene.childs[i].selected = false;
                                } else if (scene.childs[i].selected == false) {
                                    scene.childs[i].selected = true;
                                }
                            }
                        }
                    },
                    "toggleToolbar": {
                        "hideToolbar": function() {
                            $(".mypanel").addClass("hide");
                            $(".controlToolbar").siblings("a").text("显示工具栏");
                        },
                        "showToolbar": function() {
                            $(".mypanel").removeClass("hide");
                            $(".controlToolbar").siblings("a").text("隐藏工具栏");
                        }
                    }
                },
                "searchNode": function() {
                    var ipText = $("#findText").val(),
                        nodes = scene.childs.filter(function(e) {
                            return e instanceof JTopo.Node;
                        });
                    var nodes2 = nodes.filter(function(e) {
                        if (e.tip == null) return false;
                        return e.tip.indexOf(ipText) != -1;
                    });
                    nodes.forEach(function(item) {
                        if(item.scaleX != 1 && item.scaleY !=1){
                            item.scaleX = 1;
                            item.scaleY = 1;
                        }
                    });
                    if (ipText != null && ipText != "") {
                        if (nodes2.length > 0) {
                            nodes2.forEach(function(node){
                                function nodeFlash(node, n) {
                                    if (n == 0) {
                                        node.selected = false;
                                        return;
                                    }
                                    node.selected = !node.selected;
                                    node.scaleX = 2;
                                    node.scaleY = 2;
                                    setTimeout(function() {
                                        nodeFlash(node, n - 1);
                                    }, 300);
                                }
                                // 闪烁几下
                                nodeFlash(node, 10);
                            });
                        } else {
                            $(".modal-title").text("提示框");
                            $(".addOption").parent().addClass("hide");
                            $(".modal-body-div").text("你所查询的IP未找到").removeClass("hide");
                            $(" #myModal").modal('show');
                            //alert("你所查询的IP未找到");
                        }
                    }
                },
                "Jnode": {
                    "alarm": function(node, nodeValue) {
                        if ($("#alarm-button").prop("checked")) {
                            switch (nodeValue) {
                                case "0":
                                    node.alarmNum = 0;
                                    node.alarmTip = null;
                                    node.alarm = node.alarmTip;
                                    break;
                                case "1":
                                    node.alarmNum = 1;
                                    node.alarmTip = "普通告警";
                                    node.alarm = node.alarmTip;
                                    break;
                                case "2":
                                    node.alarmNum = 2;
                                    node.alarmTip = "重要告警";
                                    node.alarm = node.alarmTip;
                                    break;
                                case "3":
                                    node.alarmNum = 3;
                                    node.alarmTip = "紧急告警";
                                    node.alarm = node.alarmTip;
                                    break;
                            }
                        } else {
                            switch (nodeValue) {
                                case "0":
                                    node.alarmNum = 0;
                                    node.alarmTip = null;
                                    node.alarm = null;
                                    break;
                                case "1":
                                    node.alarmNum = 1;
                                    node.alarmTip = "普通告警";
                                    node.alarm = null;
                                    break;
                                case "2":
                                    node.alarmNum = 2;
                                    node.alarmTip = "重要告警";
                                    node.alarm = null;
                                    break;
                                case "3":
                                    node.alarmNum = 3;
                                    node.alarmTip = "紧急告警";
                                    node.alarm = null;
                                    break;
                            }
                        }

                    },
                    "linkValue": function(kpiOptionVal, dataVal, linkName) {
                        var dataVal=dataVal-0;
                        switch (kpiOptionVal) {
                            case "1":
                            case "20":
                            case "21":
                                // 0-->255,255-->100,0 410
                                // 0-->255,0,255
                                // 实时流量
                                linkName.tiptext = dataVal;
                                if (((dataVal / 1024) / 1024) / 1024 - 1 >= 0) {
                                    // 此处设置的是G单位的相关展示 类似红色 0-->255 0 255
                                    if (parseInt((((dataVal / 1024) / 1024) / 1024) * (255 / 1024)) >= 255) {
                                        linkName.strokeColor = "255,0,255";
                                    } else {
                                        linkName.strokeColor =
                                            parseInt((((dataVal / 1024) / 1024) / 1024) * (255 / 1024)) + ",0,255";
                                    }
                                    if ((((dataVal / 1024) / 1024) / 1024) %
                                        parseInt((((dataVal / 1024) / 1024) / 1024))) {
                                        linkName.tip = (((dataVal / 1024) / 1024) / 1024).toFixed(2) + "G";
                                    } else {
                                        linkName.tip = ((dataVal / 1024) / 1024) / 1024 + "G";
                                    }
                                } else if ((dataVal / 1024) / 1024 - 1 >= 0) {
                                    // 此处设置的是M单位的相关展示 类似橙色 0 255-->0 255
                                    linkName.strokeColor = "0," +
                                    255 - parseInt(((dataVal / 1024) / 1024) * (255 / 1024)) + ",255";
                                    if (((dataVal / 1024) / 1024) %
                                        parseInt(((dataVal / 1024) / 1024))) {
                                        linkName.tip = ((dataVal / 1024) / 1024).toFixed(2) + "M";
                                    } else {
                                        linkName.tip = (dataVal / 1024) / 1024 + "M";
                                    }
                                } else if (dataVal / 1024 - 1 >= 0) {
                                    // 此处设置的是KB单位的相关展示 类似server 0 255 0-->255
                                    linkName.strokeColor = "0,255," + parseInt((dataVal / 1024) * (255 / 1024));
                                    if ((dataVal / 1024) % parseInt(dataVal / 1024)) {
                                        linkName.tip = (dataVal / 1024).toFixed(2) + "kb";
                                    } else {
                                        linkName.tip = dataVal / 1024 + "kb";
                                    }
                                } else {
                                    // 此处设置的为B单位的的相关展示 类似subnet 255-->0 255 0
                                    linkName.strokeColor = 255 - parseInt(dataVal * (255 / 1024)) + ",255,0";
                                    if(dataVal>1){
                                        if (dataVal%parseInt(dataVal)) {
                                            linkName.tip = dataVal.toFixed(2) + "b";
                                        } else {
                                            linkName.tip = dataVal + "b";
                                        }
                                    }else{
                                        linkName.tip = dataVal.toFixed(3) + "b";
                                    }

                                }
                                break;
                            case "2":
                            case "18":
                                // 数据包速率
                                linkName.tiptext = dataVal;
                                if (((dataVal / 1024) / 1024) / 1024 - 1 >= 0) {
                                    // 此处设置的是G单位的相关展示 类似红色 0-->255 0 255
                                    if (parseInt((((dataVal / 1024) / 1024) / 1024) * (255 / 1024)) >= 255) {
                                        linkName.strokeColor = "255,0,255";
                                    } else {
                                        linkName.strokeColor =
                                            parseInt((((dataVal / 1024) / 1024) / 1024) * (255 / 1024)) + ",0,255";
                                    }
                                    if ((((dataVal / 1024) / 1024) / 1024) %
                                        parseInt((((dataVal / 1024) / 1024) / 1024))) {
                                        linkName.tip = (((dataVal / 1024) / 1024) / 1024).toFixed(2) + "GPS";
                                    } else {
                                        linkName.tip = ((dataVal / 1024) / 1024) / 1024 + "GPS";
                                    }
                                } else if ((dataVal / 1024) / 1024 - 1 >= 0) {
                                    // 此处设置的是M单位的相关展示 类似橙色 0 255-->0 255
                                    linkName.strokeColor = "0," +
                                    255 - parseInt(((dataVal / 1024) / 1024) * (255 / 1024)) + ",255";
                                    if (((dataVal / 1024) / 1024) %
                                        parseInt(((dataVal / 1024) / 1024))) {
                                        linkName.tip = ((dataVal / 1024) / 1024).toFixed(2) + "MPS";
                                    } else {
                                        linkName.tip = (dataVal / 1024) / 1024 + "MPS";
                                    }
                                } else if (dataVal / 1024 - 1 >= 0) {
                                    // 此处设置的是KB单位的相关展示 类似server 0 255 0-->255
                                    linkName.strokeColor = "0,255," + parseInt((dataVal / 1024) * (255 / 1024));
                                    if ((dataVal / 1024) % parseInt(dataVal / 1024)) {
                                        linkName.tip = (dataVal / 1024).toFixed(2) + "kbps";
                                    } else {
                                        linkName.tip = dataVal / 1024 + "kbps";
                                    }
                                } else {
                                    // 此处设置的为B单位的的相关展示 类似subnet 255-->0 255 0
                                    linkName.strokeColor = 255 - parseInt(dataVal * (255 / 1024)) + ",255,0";
                                    if(dataVal>1){
                                        if (dataVal%parseInt(dataVal)) {
                                            linkName.tip = dataVal.toFixed(2) + "bps";
                                        } else {
                                            linkName.tip = dataVal + "bps";
                                        }
                                    }else{
                                        linkName.tip = dataVal.toFixed(3) + "bps";
                                    }
                                }
                                break;
                            case "3":
                            case "4":
                            case "5":
                            case "6":
                            case "22":
                                // 服务端时延
                                linkName.tiptext = dataVal;
                                if ((dataVal / 1000) / 60 - 1 >= 0) {
                                    // 此处设置的是M单位的相关展示 类似橙色 0 255-->0 255
                                    if(parseInt(((dataVal / 1000) / 60) * (255 / 60))>=255){
                                        linkName.strokeColor = "255,0,255";
                                    }else{
                                        linkName.strokeColor = "0,255," + parseInt(((dataVal / 1000) / 60) * (255 / 60));
                                    }
                                    if (((dataVal / 1000) / 60) %
                                        parseInt(((dataVal / 1000) / 60))) {
                                        linkName.tip = ((dataVal / 1000) / 60).toFixed(2) + "m";
                                    } else {
                                        linkName.tip = (dataVal / 1000) / 60 + "m";
                                    }
                                } else if (dataVal / 1000 - 1 >= 0) {
                                    // 此处设置的是s单位的相关展示 类似server 0 255 0-->255
                                    linkName.strokeColor = "0,255," + parseInt((dataVal / 1000) * (255 / 60));
                                    if ((dataVal / 1000) % parseInt(dataVal / 1000)) {
                                        linkName.tip = (dataVal / 1000).toFixed(2) + "s";
                                    } else {
                                        linkName.tip = dataVal / 1000 + "s";
                                    }
                                } else if (dataVal) {
                                    // 此处设置的为ms单位的的相关展示 类似subnet 255-->0 255 0
                                    linkName.strokeColor = parseInt(255 - dataVal * (255 / 1000)) + ",255,0";
                                    if(dataVal>1){
                                        if(dataVal%parseInt(dataVal)){
                                            linkName.tip = dataVal.toFixed(2) + "ms";
                                        }else{
                                            linkName.tip = dataVal + "ms";
                                        }
                                    }else{
                                        linkName.tip = dataVal.toFixed(3) + "ms";
                                    }

                                } else {
                                    linkName.tip = dataVal + "ms";
                                }
                                break;
                            case "7":
                            case "8":
                            case "9":
                            case "14":
                            case "15":
                            case "16":
                            case "17":
                            case "19":
                                // 网络传输丢包率
                                linkName.tiptext = dataVal;
                                if (dataVal > 100) {
                                    linkName.strokeColor = "0,255,255";
                                    if(dataVal%parseInt(dataVal)){
                                        linkName.tip = dataVal.toFixed(2) + "%";
                                    }else{
                                        linkName.tip = dataVal + "%";
                                    }
                                } else if (dataVal) {
                                    // 255-->0 255 0
                                    linkName.strokeColor = parseInt(255 - dataVal * (100 / 255)) + ",255,0";
                                    if(dataVal>1){
                                        if(dataVal%parseInt(dataVal)){
                                            linkName.tip = dataVal.toFixed(2) + "%";
                                        }else{
                                            linkName.tip = dataVal + "%";
                                        }
                                    }else{
                                        linkName.tip = dataVal.toFixed(3) + "%";
                                    }
                                } else {
                                    linkName.tip = dataVal + "%";
                                }
                                break;
                            case "10":
                            case "11":
                            case "12":
                            case "13":
                                // 通信中断数量
                                linkName.tiptext = dataVal;
                                if (dataVal > 1020) {
                                    linkName.strokeColor = "255,0,255";
                                    if(dataVal%parseInt(dataVal)){
                                        linkName.tip = dataVal.toFixed(2) + "个";
                                    }else{
                                        linkName.tip = dataVal + "个";
                                    }
                                } else if (dataVal > 765) {
                                    // 0-->255 0 255
                                    linkName.strokeColor = parseInt(dataVal - 766) + ",0,255";
                                    if(dataVal%parseInt(dataVal)){
                                        linkName.tip = dataVal.toFixed(2) + "个";
                                    }else{
                                        linkName.tip = dataVal + "个";
                                    }
                                } else if (dataVal > 510) {
                                    // 0 255-->0 255
                                    linkName.strokeColor = "0," + parseInt(dataVal - 510) + ",255";
                                    if(dataVal % parseInt(dataVal)){
                                        linkName.tip = dataVal.toFixed(2) + "个";
                                    }else{
                                        linkName.tip = dataVal + "个";
                                    }
                                } else if (dataVal > 255) {
                                    // 0 255 0-->255
                                    linkName.strokeColor = "0,255," + parseInt(dataVal - 255);
                                    if(dataVal % parseInt(dataVal)){
                                        linkName.tip = dataVal.toFixed(2) + "个";
                                    }else{
                                        linkName.tip = dataVal + "个";
                                    }

                                } else if (dataVal) {
                                    // 255-->0 255 0
                                    linkName.strokeColor = parseInt(255 - dataVal) + ",255,0";
                                    if(dataVal>1){
                                        if(dataVal % parseInt(dataVal)){
                                            linkName.tip = dataVal.toFixed(2) + "个";
                                        }else{
                                            linkName.tip = dataVal + "个";
                                        }
                                    }else{
                                        linkName.tip = dataVal.toFixed(3) + "个";
                                    }
                                } else {
                                    linkName.strokeColor = 255 - dataVal + ",255,0";
                                    linkName.tip = dataVal + "个";
                                }
                                break;
                        }
                    },
                    "flgLinkValueIp": function(node, kpiOptionVal, data) {
                        data.forEach(function(kpitem) {
                            node.outLinks.forEach(function(linkName) {
                                if (linkName.nodeA.tip.split(":")[0] == kpitem.ip) {
                                    if (linkName.nodeZ.tip == kpitem.port) {
                                        portal.Jnode.linkValue(kpiOptionVal,kpitem.value,linkName);
                                    }
                                }
                            })
                        });
                    },
                    "flgLinkValuePort": function(node, kpiOptionVal, data) {
                        data.forEach(function(kpitem) {
                            node.outLinks.forEach(function(linkName) {
                                if (linkName.nodeZ.tip.split(":")[0] == kpitem.ip) {
                                    portal.Jnode.linkValue(kpiOptionVal,kpitem.value,linkName);
                                }
                            })
                        });
                    },
                    "linkedVal": function(kpiOptionVal, data) {
                        data.forEach(function(item, index) {
                            scene.childs.forEach(function(ilink, ndex) {
                                if (ilink.elementType == "link") {
                                    if (ilink.nodeA.tip == item.from_ip) {
                                        if (ilink.nodeZ.tip == item.to_info) {
                                            portal.Jnode.linkValue(kpiOptionVal,item.value,ilink);
                                        }
                                    } else if (ilink.nodeZ.tip == item.from_ip) {
                                        if (ilink.nodeA.tip == item.to_info) {
                                            portal.Jnode.linkValue(kpiOptionVal,item.value,ilink);
                                        }
                                    }
                                } else if (ilink.elementType == "node") {
                                    if (ilink.snodeArry) {
                                    } else {
                                        if (ilink.tip == item.from_ip) {
                                            portal.Jnode.alarm(ilink,item.from_alarm);
                                        } else if (ilink.tip == item.to_info) {
                                            portal.Jnode.alarm(ilink,item.to_alarm);
                                        }
                                    }
                                }
                            });
                        });
                    }
                },
                "fun": {
                    "getLocaltime": function(nS) {
                        return new Date(parseInt(nS) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
                    },
                    "enterinputIpval": function(ip) {
                        var ipNet = ip.split("/"),
                            ipd = ipNet[0].split(".");
                        $("input[name='ip_1']").val(ipd[0]);
                        $("input[name='ip_2']").val(ipd[1]);
                        $("input[name='ip_3']").val(ipd[2]);
                        $("input[name='ip_4']").val(ipd[3]);
                        $("input[name='bits']").val(ipNet[1]);
                    },
                    "tdtextClick":function(nodeJson){
                        scene.clear();
                        flag = nodeJson[0].flag - 0;
                        var getJsonNodeArray = []; //所有得到点的集合数组
                        nodeJson.forEach(function(item, index) {
                            if (item.elementType == "node") {
                                var itemNode = newCircleNode(item.x - 0, item.y - 0, item.tip, item.fillColor);
                                if (item.snodeArry) {
                                    itemNode.id = item.id; //将id赋值给已画的点
                                    itemNode.tip = item.tip; //将tip赋值给已画的点
                                    itemNode.radius = item.radius; //将大小赋值给已画的点
                                    itemNode.snodeArry = item.snodeArry; //将合成此点的初始点集合赋值以将将来赞释读
                                    portal.Jnode.alarm(itemNode, item.alarmNum); //释读告警数值
                                    getJsonNodeArray[itemNode.id] = itemNode; //将此点存进数组
                                } else {
                                    itemNode.id = item.id;
                                    itemNode.tip = item.tip;
                                    itemNode.radius = item.radius;
                                    itemNode.relAy = item.relAy;
                                    itemNode.portText = item.portText; //将portText赋值给已画的点
                                    portal.Jnode.alarm(itemNode, item.alarmNum);
                                    getJsonNodeArray[itemNode.id] = itemNode;
                                }
                            }
                        });
                        nodeJson.forEach(function(item, index) {
                            if (item.elementType == "link") {
                                var ilink = newLink(getJsonNodeArray[item.nodeAid], getJsonNodeArray[item.nodeZid]);
                                ilink.lineWidth = item.lineWidth;
                                ilink.strokeColor = item.strokeColor;
                                ilink.tip = item.tip;
                                ilink.tiptext = item.tiptext;
                                JTopo.layout.layoutNode(scene, getJsonNodeArray[item.nodeAid], true);
                            }
                        });
                        if (flag) {
                            $("button[name='center']").removeClass("hide");
                            $("button[name='save']").removeClass("hide");
                            $("button[name='export_image']").removeClass("hide");
                            $(".showCenter").addClass("hide");
                        } else {
                            $(".showCenter").removeClass("hide");
                            $("button[name='save']").addClass("hide");
                            if(tryErr){
                                $("button[name='center']").addClass("hide");
                                $("button[name='export_image']").addClass("hide");
                            }else {
                                $("button[name='center']").removeClass("hide");
                                $("button[name='export_image']").removeClass("hide");
                            }
                        }
                    }
                }
            };
            portal.tool.homeNode(data);
            portal.showSname();
            /* 右键菜单处理 */
            - function() {
                // 当单击到stage场景对象的时候右键菜单隐藏
                stage.click(function(event) {
                    if (event.button == 0) { // 左键
                        $("#contextmenu").hide();
                        $("#linkmenu").hide();
                    }
                });
                // 右键所有的功能入口
                $("#contextmenu li").click(function() {
                    var text = $(this).children("a").text();
                    switch (text) {
                        case "复制当前对象IP":
                            portal.Rclick.copyNodetext();
                            $("#contextmenu").hide();
                            break;
                        case "以此为中心显示":
                            portal.Rclick.showthisNodeCenter();
                            $("#contextmenu").hide();
                            break;
                        case "删除对象":
                            portal.Rclick.delNode();
                            $("#contextmenu").hide();
                            break;
                        case "全选":
                            portal.Rclick.selectAll();
                            break;
                        case "反选":
                            portal.Rclick.selectNotselectednode();
                            break;
                        case "隐藏工具栏":
                            portal.Rclick.toggleToolbar.hideToolbar();
                            setTimeout(function() {
                                $("#contextmenu").hide();
                            }, 50);
                            break;
                        case "显示工具栏":
                            portal.Rclick.toggleToolbar.showToolbar();
                            $("#contextmenu").hide();
                            break;
                        case "框选模式":
                            stage.mode = "select";
                            $(".kxcheck").text("退出框选模式");
                            $(".sselect").parent().attr("data-original-title", "退出框选模式");
                            $("#contextmenu").hide();
                            break;
                        case "退出框选模式":
                            stage.mode = "normal";
                            $(".kxcheck").text("框选模式");
                            $(".sselect").parent().attr("data-original-title", "框选模式");
                            $("#contextmenu").hide();
                            break;
                        case "居中显示":
                            portal.tool.showCenter();
                            $("#contextmenu").hide();
                            break;
                        case "全屏显示":
                            portal.tool.fullScreen(canvas);
                            $("#contextmenu").hide();
                            break;
                        case "显示IP地址":
                            portal.tool.toggleIptext.showIptext();
                            $("#contextmenu").hide();
                            break;
                        case "取消显示IP":
                            portal.tool.toggleIptext.hideIptext();
                            $("#contextmenu").hide();
                            break;
                        case "导出PNG":
                            portal.tool.exportImg();
                            $("#contextmenu").hide();
                            break;
                        case "保存状态":
                            portal.tool.saveNode();
                            break;
                        case "产品说明":
                            portal.tool.help();
                            $("#contextmenu").hide();
                            break;
                        case "放大对象":
                            currentNode.scaleX += 0.2;
                            currentNode.scaleY += 0.2;
                            break;
                        case "缩小对象":
                            currentNode.scaleX -= 0.2;
                            currentNode.scaleY -= 0.2;
                            break;
                    }
                });
                // 右键在连线上的所有的功能入口
                $("#linkmenu li").click(function() {
                    var text = $(this).children("a").text();
                    switch (text) {
                        case "修改颜色(随机)":
                            currentLink.strokeColor = JTopo.util.randomColor(); // 线条颜色随机
                            break;
                        case "连线加粗":
                            currentLink.lineWidth += 1;
                            break;
                        case "连线变细":
                            currentLink.lineWidth -= 1;
                            break;
                        case "变成虚线":
                            currentLink.dashedPattern = 5;
                            break;
                        case "变成实线":
                            currentLink.dashedPattern = null;
                            break;
                        case "删除连线":
                            scene.remove(currentLink);
                            break;
                    }
                });
                $("#contextmenu").hover(function() {
                    $(this).fadeIn();
                }, function() {
                    $(this).fadeOut();
                }); // 右键菜单栏的显示和消失
                $("#linkmenu").hover(function() {
                    $(this).fadeIn();
                }, function() {
                    $(this).fadeOut();
                }); // 连线的右键菜单的显示和消失
                // 增加咯键盘DELL键盘删除功能
                $(window).keydown(function(event) {
                    if (event.keyCode == 46 || event.which == 46) {
                        portal.Rclick.delNode();
                    }
                });
            }();
            // 工具栏
            ! function() {
                // 默认模式
                $(".sdefault").click(function() {
                    $(".mloadingDiv").removeClass("hide");
                    $(".showCenter").removeClass("hide"); // 把以此为中心功能给开放
                    flag = 0;
                    $("button[name='save']").addClass("hide");
                    if(tryErr){
                        $("button[name='center']").addClass("hide");
                        $("button[name='export_image']").addClass("hide");
                    }else {
                        $("button[name='center']").removeClass("hide");
                        $("button[name='export_image']").removeClass("hide");
                    }
                    $.ajax({
                        url: "/jtopo/getJtopoSys.do",
                        type: "post",
                        data: {
                            "kpi": $(".kpi").children("option:selected").val(),
                            "start": 0,
                            "end": 0,
                            "lidu": 600
                        },
                        dataType: "json",
                        success: function(data) {
                            scene.clear();
                            //$(".showIp").text("显示IP地址");
                            portal.tool.homeNode(data);
                            //portal.tool.showCenter();
                        }
                    })
                });
                // 框选模式
                $(".sselect").click(function() {
                    portal.tool.selectMode();
                });
                // 缩放并居中显示
                $(".scenter").click(function() {
                    portal.tool.showCenter();
                });
                // 导出PNG
                $(".sexport_image").click(function() {
                    portal.tool.exportImg(stage);
                });
                // 全屏显示
                $(".sfull_screen").click(function() {
                    portal.tool.fullScreen(canvas);
                });
                // 保存状态
                $(".ssave").click(function() {
                    portal.tool.saveNode();
                });
                // 显示IP
                $(".sshowIP").click(function() {
                    var changeIptext = $(".sshowIP").parent().attr("data-original-title");
                    if(changeIptext == "显示IP"){
                        portal.tool.toggleIptext.showIptext();
                        $(".sshowIP").parent().attr("data-original-title","取消显示IP");
                    }else{
                        portal.tool.toggleIptext.hideIptext();
                        $(".sshowIP").parent().attr("data-original-title","显示IP");
                    }
                });
                // 匹配用户设置
                $(".susrerSeting").click(function() {
                    if(!flag){
                        $(".mloadingDiv").removeClass("hide");
                        $.ajax({
                            url: "/jtopo/getJtopoIpnet.do",
                            type: "post",
                            data: "",
                            dataType: "json",
                            success: function(data) {
                                $(".mloadingDiv").removeClass("hide");
                                data.forEach(function(item) {
                                    portal.fun.enterinputIpval(item.ipnet); //将用户设置的网段传入
                                    portal.tool.IPmerge.calNBFL($(".form_ip")[0]); //将form表单作为参数传进去
                                    var s1 = $("input[name='firstadr_1']").val(),
                                        s2 = $("input[name='firstadr_2']").val(),
                                        s3 = $("input[name='firstadr_3']").val(),
                                        s4 = $("input[name='firstadr_4']").val(),
                                        t1 = $("input[name='lastadr_1']").val(),
                                        t2 = $("input[name='lastadr_2']").val(),
                                        t3 = $("input[name='lastadr_3']").val(),
                                        t4 = $("input[name='lastadr_4']").val(),
                                        resultArry = [], //将得到的范围值存给变量 将页面中的点与这范围进行筛选并将筛选结果赋值给resultArry数组
                                        x = Math.random() * parseInt(window.innerWidth * 0.6) +
                                            parseInt(window.innerWidth * 0.2),
                                        y = Math.random() * parseInt((window.innerHeight -
                                            $(".navbar-logo").height() - 20) * 0.6) +
                                            parseInt((window.innerHeight - $(".navbar-logo ").height() - 20) * 0.2),
                                        kpiVal = $(".kpi").children("option:selected").val();
                                    scene.childs.forEach(function(jtem) {
                                        if (jtem.elementType == "node") {
                                            if (jtem.tip.indexOf("/") == -1) {
                                                //无“/”一种算法
                                                var nodeTip = jtem.tip.split(".");
                                                if (s1 != "") {
                                                    if (t1 != "") {
                                                        if (nodeTip[0] >= s1 && nodeTip[0] <= t1 &&
                                                            nodeTip[1] >= s2 && nodeTip[1] <= t2 &&
                                                            nodeTip[2] >= s3 && nodeTip[2] <= t3 &&
                                                            nodeTip[3] >= s4 && nodeTip[3] <= t4) {
                                                            resultArry.push(jtem);
                                                        }
                                                    } else {
                                                        //最后可用IP为空的情况 即范围值(min-max)max不存在的情况
                                                        if (nodeTip[0] == s1 && nodeTip[1] == s2 && nodeTip[2] == s3 && nodeTip[3] == s4) {
                                                            resultArry.push(jtem);
                                                        }
                                                    }
                                                }
                                            } else {
                                                //带“/”一种算带
                                                portal.fun.enterinputIpval(jtem.tip);
                                                portal.tool.IPmerge.calNBFL($(".form_ip")[0]);
                                                var js1 = $("input[name='firstadr_1']").val(),
                                                    js2 = $("input[name='firstadr_2']").val(),
                                                    js3 = $("input[name='firstadr_3']").val(),
                                                    js4 = $("input[name='firstadr_4']").val(),
                                                    jt1 = $("input[name='lastadr_1']").val(),
                                                    jt2 = $("input[name='lastadr_2']").val(),
                                                    jt3 = $("input[name='lastadr_3']").val(),
                                                    jt4 = $("input[name='lastadr_4']").val();
                                                if (js1 != "") {
                                                    if (jt1 != "") {
                                                        if (js1 >= s1 && js1 <= t1 &&
                                                            js2 >= s2 && js2 <= t2 &&
                                                            js3 >= s3 && js3 <= t3 &&
                                                            js4 >= s4 && js4 <= t4 &&
                                                            jt1 >= s1 && jt1 <= t1 &&
                                                            jt2 >= s2 && jt2 <= t2 &&
                                                            jt3 >= s3 && jt3 <= t3 &&
                                                            jt4 >= s4 && jt4 <= t4) {
                                                            resultArry.push(jtem);
                                                        }
                                                    } else {
                                                        if (js1 >= s1 && js1 <= t1 &&
                                                            js2 >= s2 && js2 <= t2 &&
                                                            js3 >= s3 && js3 <= t3 &&
                                                            js4 >= s4 && js4 <= t4) {
                                                            resultArry.push(jtem);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    });
                                    if (resultArry.length) {
                                        var centerNewNode = newCircleNode(x, y, item.name, "89,0,255"),
                                            centempArry = [], //暂存centerNewNode的已连接点的tip
                                            pice = 0, //连线重复的次数
                                            linkIndex = [], //重复连线的下标暂存
                                            alarmAy = []; //告警暂存
                                        centerNewNode.setSize(16, 16);
                                        centerNewNode.snodeArry = resultArry; //把合并咯的点给保存在centerNode的属性里面
                                        resultArry.forEach(function(node, index) {
                                            //console.log(node);
                                            centerNewNode.snodeArry[index].nodeInlinks = node.inLinks; //将此点所有内连的线给存起来
                                            centerNewNode.snodeArry[index].nodeOutlinks = node.outLinks; //将此点所有外连的线给存起来
                                            alarmAy.push(node.alarmNum);
                                            scene.remove(node);
                                        });
                                        portal.Jnode.alarm(centerNewNode, Math.max.apply(null, alarmAy)); //展示最大告警
                                        centerNewNode.snodeArry.forEach(function(eNode) {
                                            if (eNode.nodeInlinks.length) {
                                                for (var i = 0; i < eNode.nodeInlinks.length; i++) {
                                                    scene.childs.forEach(function(scNode) {
                                                        if (scNode.elementType == "node") {
                                                            if (eNode.nodeInlinks[i].nodeA.tip == scNode.tip) {
                                                                if (centerNewNode.outLinks && centerNewNode.outLinks.length) {
                                                                    for (var j = 0; j < centerNewNode.outLinks.length; j++) {
                                                                        if (centempArry.indexOf(centerNewNode.outLinks[j].nodeZ.tip) == -1) {
                                                                            centempArry.push(centerNewNode.outLinks[j].nodeZ.tip);
                                                                        }
                                                                    }
                                                                    if (centempArry.indexOf(eNode.nodeInlinks[i].nodeA.tip) == -1) {
                                                                        var tlink = newLink(centerNewNode, scNode);
                                                                        tlink.tip = eNode.nodeInlinks[i].tip;
                                                                        tlink.strokeColor = eNode.nodeInlinks[i].strokeColor;
                                                                        tlink.tiptext = eNode.nodeInlinks[i].tiptext;
                                                                    } else {
                                                                        centerNewNode.outLinks[centempArry.indexOf(eNode.nodeInlinks[i].nodeA.tip)].tiptext += eNode.nodeInlinks[i].tiptext;
                                                                        if (kpiVal != 1 && kpiVal != 20 && kpiVal != 21 && kpiVal != 10 && kpiVal != 11 && kpiVal != 12 && kpiVal != 13) {
                                                                            var keyl = centempArry.indexOf(eNode.nodeInlinks[i].nodeA.tip);
                                                                            linkIndex[keyl] = ++pice;
                                                                        } else {
                                                                            portal.Jnode.linkValue(kpiVal,
                                                                                centerNewNode.outLinks[centempArry.indexOf(eNode.nodeInlinks[i].nodeA.tip)].tiptext,
                                                                                centerNewNode.outLinks[centempArry.indexOf(eNode.nodeInlinks[i].nodeA.tip)]);
                                                                        }
                                                                    }
                                                                } else {
                                                                    var tlink = newLink(centerNewNode, scNode);
                                                                    tlink.tip = eNode.nodeInlinks[i].tip;
                                                                    tlink.strokeColor = eNode.nodeInlinks[i].strokeColor;
                                                                    tlink.tiptext = eNode.nodeInlinks[i].tiptext;
                                                                }
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                            if (eNode.nodeOutlinks.length) {
                                                for (var i = 0; i < eNode.nodeOutlinks.length; i++) {
                                                    scene.childs.forEach(function(scNode) {
                                                        if (scNode.elementType == "node") {
                                                            if (eNode.nodeOutlinks[i].nodeZ.tip == scNode.tip) {
                                                                if (centerNewNode.outLinks && centerNewNode.outLinks.length) {
                                                                    for (var j = 0; j < centerNewNode.outLinks.length; j++) {
                                                                        if (centempArry.indexOf(centerNewNode.outLinks[j].nodeZ.tip) == -1) {
                                                                            centempArry.push(centerNewNode.outLinks[j].nodeZ.tip);
                                                                        }
                                                                    }
                                                                    if (centempArry.indexOf(eNode.nodeOutlinks[i].nodeZ.tip) == -1) {
                                                                        var tlink = newLink(centerNewNode, scNode);
                                                                        tlink.tip = eNode.nodeOutlinks[i].tip;
                                                                        tlink.strokeColor = eNode.nodeOutlinks[i].strokeColor;
                                                                        tlink.tiptext = eNode.nodeOutlinks[i].tiptext;
                                                                    } else {
                                                                        centerNewNode.outLinks[centempArry.indexOf(eNode.nodeOutlinks[i].nodeZ.tip)].tiptext += eNode.nodeOutlinks[i].tiptext;
                                                                        if (kpiVal != 1 && kpiVal != 20 && kpiVal != 21 && kpiVal != 10 && kpiVal != 11 && kpiVal != 12 && kpiVal != 13) {
                                                                            var keyl = centempArry.indexOf(eNode.nodeInlinks[i].nodeA.tip);
                                                                            linkIndex[keyl] = ++pice;
                                                                        } else {
                                                                            portal.Jnode.linkValue(kpiVal,
                                                                                centerNewNode.outLinks[centempArry.indexOf(eNode.nodeOutlinks[i].nodeZ.tip)].tiptext,
                                                                                centerNewNode.outLinks[centempArry.indexOf(eNode.nodeOutlinks[i].nodeZ.tip)]);
                                                                        }
                                                                    }
                                                                } else {
                                                                    var tlink = newLink(centerNewNode, scNode);
                                                                    tlink.tip = eNode.nodeOutlinks[i].tip;
                                                                    tlink.strokeColor = eNode.nodeOutlinks[i].strokeColor;
                                                                    tlink.tiptext = eNode.nodeOutlinks[i].tiptext;
                                                                }
                                                            }
                                                        }
                                                    })
                                                }
                                            }
                                        });
                                        if (pice) {
                                            for (var k = 0; k < linkIndex.length; k++) {
                                                if (linkIndex[k] != undefined) {
                                                    var setvalue = centerNewNode.outLinks[k].tiptext / linkIndex[k];
                                                    portal.Jnode.linkValue(kpiVal, setvalue, centerNewNode.outLinks[k]);
                                                }
                                            }
                                        }
                                    }
                                    $(".mloadingDiv").addClass("hide");
                                });
                            }
                        })
                    }
                });
                // 产品说明
                $(".sexplain").click(function() {
                    portal.tool.help();
                });
                // 请求保存
                $(".qsave").click(function() {
                    $(".modal-body-div").addClass("hide");
                    $(".addOption").parent().removeClass("hide");
                    $(".f-click").hide();
                    $("#myModal").modal('show');
                });
            }();
            // 导航栏功能区
            ~ function() {
                // 告警提示的显示与否
                $("#alarm-button").click(function() {
                    if ($(this).prop("checked")) {
                        scene.childs.forEach(function(item) {
                            if (item.elementType == "node") {
                                item.alarm = item.alarmTip;
                            }
                        })
                    } else {
                        scene.childs.forEach(function(item) {
                            if (item.elementType == "node") {
                                item.alarm = null;
                            }
                        })
                    }
                });
                // 监视kpi子元素的变化
                $(".kpi").change(function() {
                    $(".mloadingDiv").removeClass("hide");
                    var thisOption = $(this).children("option:selected").val();
                    scene.childs.forEach(function(item) {
                        if (item.elementType == "link") {
                            item.tip = null;
                            item.strokeColor="166,183,53";
                            item.tiptext = 0;
                        }
                    });
                    if (flag) {
                        // 如果为钻取状态
                        $(".showCenter").removeClass("hide");
                        scene.childs.forEach(function(item, index) {
                            if (item.elementType == "node") {
                                if (item.tip.indexOf(".") != -1) {
                                    // 此为IP 请求IP端口
                                    if (item.outLinks.length) {
                                        $.ajax({
                                            url: "/jtopo/getJtopoSysIp.do",
                                            type: "post",
                                            data: {
                                                "ip": item.tip.split(":")[0],
                                                "kpi": thisOption,
                                                "start": 0,
                                                "end": 0
                                            },
                                            dataType: "json",
                                            success: function(okpi) {
                                                portal.Jnode.flgLinkValueIp(item, thisOption, okpi);
                                            }
                                        })
                                    }
                                } else {
                                    // 此为端口 请求端口接口
                                    if (item.outLinks.length) {
                                        $.ajax({
                                            url: "/jtopo/getJtopoSysPort.do",
                                            type: "post",
                                            dataType: "json",
                                            data: {
                                                "ip": item.inLinks[0].nodeA.tip.split(":")[0],
                                                "port": item.tip,
                                                "kpi": thisOption,
                                                "start": 0,
                                                "end": 0
                                            },
                                            success: function(okpi) {
                                                portal.Jnode.flgLinkValuePort(item, thisOption, okpi);
                                            }
                                        })
                                    }
                                }
                            }
                        });
                        setTimeout(function() {
                            $(".mloadingDiv").addClass("hide");
                        }, 600);
                    } else {
                        // 如果为非钻取状态
                        $(".showCenter").removeClass("hide");
                        $.ajax({
                            url: "/jtopo/getJtopoSys.do",
                            type: "post",
                            data: {
                                "kpi": thisOption,
                                "start": 0,
                                "end": 0,
                                "lidu": 600
                            },
                            dataType: "json",
                            success: function(system) {
                                portal.Jnode.linkedVal(thisOption, system);
                                //计算匹配用户设置的点的连线的KPI值
                                scene.childs.forEach(function(node) {
                                    if (node.snodeArry) {
                                        //console.log(node);
                                        var pices = 0,
                                            linkArry = [];
                                        node.snodeArry.forEach(function(snode) {
                                            system.forEach(function(item) {
                                                if (snode.tip == item.from_ip) {
                                                    node.outLinks.forEach(function(outLink, index) {
                                                        if (outLink.nodeZ.tip == item.to_info) {
                                                            //此处把value值赋给link
                                                            if (outLink.tiptext) {
                                                                pices++;
                                                                linkArry[index] = pices;
                                                                outLink.tiptext += item.value;
                                                            } else {
                                                                pices++;
                                                                linkArry[index] = pices;
                                                                outLink.tiptext = item.value;
                                                            }
                                                        }
                                                    })
                                                } else if (snode.tip == item.to_info) {
                                                    node.outLinks.forEach(function(outLink) {
                                                        if (outLink.nodeZ.tip == item.from_ip) {
                                                            //此处把value值赋给link
                                                            if (outLink.tiptext) {
                                                                pices++;
                                                                linkArry[index] = pices;
                                                                outLink.tiptext += item.value;
                                                            } else {
                                                                pices++;
                                                                linkArry[index] = pices;
                                                                outLink.tiptext = item.value;
                                                            }
                                                        }
                                                    })
                                                }
                                            })
                                        });
                                        //上面循环都走完之后取出Link上的value判断kpi是该累加还是该平均
                                        if (pices) {
                                            var kpiVal = $(".kpi").children("option:selected").val();
                                            if (kpiVal != 1 && kpiVal != 20 && kpiVal != 21 && kpiVal != 10 && kpiVal != 11 && kpiVal != 12 && kpiVal != 13) {
                                                //平均
                                                for (var k = 0; k < linkArry.length; k++) {
                                                    if (linkArry[k] != undefined) {
                                                        var setvalue = node.outLinks[k].tiptext / linkArry[k];
                                                        portal.Jnode.linkValue(kpiVal, setvalue, node.outLinks[k]);
                                                    }
                                                }
                                            } else {
                                                //累加
                                                for (var k = 0; k < linkArry.length; k++) {
                                                    if (linkArry[k] != undefined) {
                                                        var setvalue = node.outLinks[k].tiptext;
                                                        portal.Jnode.linkValue(kpiVal, setvalue, node.outLinks[k]);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                });
                                setTimeout(function() {
                                    $(".mloadingDiv").addClass("hide");
                                }, 600);
                            }
                        })
                    }
                });
                // 搜索IP
                $("#searchButton").click(function() {
                    portal.searchNode();
                });
                // 当在输入框按下enter键的时候触发searchButton的click事件
                window.enterPressHandler = function(event) {
                    if (event.keyCode == 13 || event.which == 13) {
                        $('#searchButton').click();
                    }
                };
            }();
            // 探索功能
            + function() {
                scene.dbclick(function(event) {
                    if (event.target == null) {
                        return
                    } else {
                        if (event.target.tip == undefined) {
                            return;
                        } else {
                            if (event.target.elementType == "node") {
                                var thisOption = $(".kpi").children("option:selected").val();
                                if (flag) {
                                    $(".showCenter").addClass("hide");
                                    var clickTip = event.target.tip;
                                    if (clickTip.indexOf(".") != -1) {
                                        // 非等于-1 则为IP 如果为IP则请求这个接口
                                        var beginTime = (new Date()).getTime();
                                        if (event.target.inLinks.length) {
                                            $(".mloadingDiv").removeClass("hide");
                                            $.ajax({
                                                url: "/jtopo/getJtopoSysIp.do",
                                                type: "post",
                                                data: {
                                                    "ip": event.target.tip,
                                                    "kpi": thisOption,
                                                    "start": 0,
                                                    "end": 0
                                                },
                                                dataType: "json",
                                                success: function(searchIn) {
                                                    //console.log(searchIn);
                                                    if (searchIn.length) {
                                                        // 防止用户再次双击事件
                                                        if (event.target.outLinks.length == 0) {
                                                            var portNodeArray = [];
                                                            searchIn.forEach(function(item, index) {
                                                                var portNode = newCircleNode(undefined, undefined, item.port, "102,204,255"),
                                                                    ilink = newLink(event.target, portNode);
                                                                portNode.radius = 8;
                                                                ilink.lineWidth = 2;
                                                                JTopo.layout.layoutNode(scene, event.target, true);
                                                                if ($(".kpi").css("display") != "none") {
                                                                    portal.Jnode.linkValue(thisOption, item.value, ilink);
                                                                }
                                                                portal.Jnode.alarm(portNode, item.to_alarm);

                                                                /*   if ($(".showIp").text() == "取消显示IP") {
                                                                 portNode.text = portNode.tip;
                                                                 portNode.mouseout(function() {
                                                                 this.text = this.tip;
                                                                 });
                                                                 } else {
                                                                 portNode.text = null;
                                                                 portNode.mouseout(function() {
                                                                 this.text = null;
                                                                 });
                                                                 }*/
                                                                if ( $(".sshowIP").parent().attr("data-original-title") == "取消显示IP") {
                                                                    portNode.text = portNode.tip;
                                                                    portNode.mouseout(function() {
                                                                        this.text = this.tip;
                                                                    });
                                                                } else {
                                                                    portNode.text = null;
                                                                    portNode.mouseout(function() {
                                                                        this.text = null;
                                                                    });
                                                                }
                                                                portNodeArray.push(portNode);
                                                            });
                                                            portNodeArray.forEach(function(portNode, index) {
                                                                if (portNode.tip == event.target.portText) {
                                                                    if (event.target.x - event.target.inLinks[0].nodeA.x) {
                                                                        portNode.x = Math.abs((event.target.x - event.target.inLinks[0].nodeA.x) / 2) + Math.min(event.target.x, event.target.inLinks[0].nodeA.x);
                                                                    } else {
                                                                        portNode.x = event.target.x;
                                                                    }
                                                                    if (event.target.y - event.target.inLinks[0].nodeA.y) {
                                                                        portNode.y = Math.abs((event.target.y - event.target.inLinks[0].nodeA.y) / 2) +
                                                                        Math.min(event.target.y, event.target.inLinks[0].nodeA.y);
                                                                    } else {
                                                                        portNode.y = event.target.y;
                                                                    }
                                                                }
                                                            });
                                                            $(".mloadingDiv").addClass("hide");
                                                        }
                                                        $(".mloadingDiv").addClass("hide");
                                                    } else {
                                                        $(".mloadingDiv").addClass("hide");
                                                        // 弹出框提示未找到
                                                        $(".addOption").parent().addClass("hide");
                                                        $(".modal-body-div").text("已经钻取到尽头了").removeClass("hide");
                                                        $(".f-click").hide();
                                                        $("#myModal").modal('show');
                                                    }
                                                }
                                            });
                                        }
                                    } else {
                                        // 否则请求这个接口 此为端口的接口
                                        $(".mloadingDiv").removeClass("hide");
                                        $.ajax({
                                            url: "/jtopo/getJtopoSysPort.do",
                                            type: "post",
                                            data: {
                                                "ip": event.target.inLinks[0].nodeA.tip,
                                                "port": event.target.tip,
                                                "kpi": thisOption,
                                                "start": 0,
                                                "end": 0
                                            },
                                            dataType: "json",
                                            success: function(searchIn) {
                                                //console.log(searchIn);
                                                //var beginTime = (new Date()).getTime();
                                                if (searchIn.length) {
                                                    if (event.target.outLinks.length == 0) {
                                                        if (event.target.inLinks[0].nodeA.portText != undefined) {
                                                            var strNodetip = event.target.inLinks[0].nodeA.inLinks[0].nodeA.inLinks[0].nodeA.tip;
                                                        }
                                                        /*   if (event.target.inLinks[0].nodeA.tip.split(":")[1] != undefined) {
                                                         var strNodetip = event.target.inLinks[0].nodeA.inLinks[0].nodeA.inLinks[0].nodeA.tip.split(":")[0] + ":" + event.target.inLinks[0].nodeA.inLinks[0].nodeA.tip;
                                                         console.log(strNodetip);
                                                         }*/
                                                        var portNodeArray = [];
                                                        searchIn.forEach(function(item, index) {
                                                            switch (item.type){
                                                                case "server":
                                                                    var color = "7,237,15";
                                                                    break;
                                                                case "client":
                                                                    var color = "255,255,255";
                                                                    break;
                                                            }
                                                            var portNode = newCircleNode(undefined, undefined, item.ip , color),
                                                                ilink = newLink(event.target, portNode);
                                                            portNode.radius = 8;
                                                            ilink.lineWidth = 2;
                                                            JTopo.layout.layoutNode(scene, event.target, true);
                                                            if ($(".kpi").css("display") != "none") {
                                                                portal.Jnode.linkValue(thisOption, item.value, ilink);
                                                            }
                                                            portal.Jnode.alarm(portNode, item.from_alarm);
                                                            portNode.portText=item.port;
                                                            if ( $(".sshowIP").parent().attr("data-original-title") == "取消显示IP") {
                                                                portNode.text = portNode.tip;
                                                                portNode.mouseout(function() {
                                                                    this.text = this.tip;
                                                                });
                                                            } else {
                                                                portNode.text = null;
                                                                portNode.mouseout(function() {
                                                                    this.text = null;
                                                                });
                                                            }
                                                            if (portNode.tip != strNodetip) {
                                                                portNodeArray.push(portNode);
                                                            } else {
                                                                scene.remove(portNode);
                                                                if (searchIn.length == 1) {
                                                                    $(".mloadingDiv").addClass("hide");
                                                                    // 弹出框提示未找到
                                                                    $(".addOption").parent().addClass("hide");
                                                                    $(".modal-body-div").text("已经钻取到尽头了").removeClass("hide");
                                                                    $(".f-click").hide();
                                                                    $("#myModal").modal('show');
                                                                }
                                                            }
                                                        });
                                                    }
                                                    $(".mloadingDiv").addClass("hide");
                                                } else {
                                                    $(".mloadingDiv").addClass("hide");
                                                    // 弹出框提示未找到
                                                    $(".addOption").parent().addClass("hide");
                                                    $(".modal-body-div").text("已经钻取到尽头了").removeClass("hide");
                                                    $(".f-click").hide();
                                                    $("#myModal").modal('show');
                                                }
                                            }
                                        });
                                    }
                                } else {
                                    if (event.target.snodeArry) {
                                        $(".mloadingDiv").removeClass("hide");
                                        //此为非保存的状态
                                        var kpiVal = $(".kpi").children("option:selected").val();
                                        var initialNodeArry = event.target.snodeArry; //把最初的点的数组给解读出来
                                        initialNodeArry.forEach(function(nodef) {
                                            if (nodef.elementType) {
                                                scene.add(nodef);
                                                portal.Jnode.alarm(nodef, nodef.alarmNum); //判断告警
                                                //判断KPI值
                                                if (nodef.nodeInlinks.length) {
                                                    for (var i = 0; i < nodef.nodeInlinks.length; i++) {
                                                        scene.childs.forEach(function(fnode) {
                                                            if (fnode.elementType == "node") {
                                                                if (fnode.tip == nodef.nodeInlinks[i].nodeA.tip) {
                                                                    var rlink = newLink(fnode, nodef);
                                                                    $.ajax({
                                                                        url: "/jtopo/getJtopoSys.do",
                                                                        type: "post",
                                                                        data: {
                                                                            "kpi": kpiVal,
                                                                            "start": 0,
                                                                            "end": 0,
                                                                            "lidu": 600
                                                                        },
                                                                        dataType: "json",
                                                                        success: function(system) {
                                                                            system.forEach(function(item) {
                                                                                if (item.from_ip == nodef.tip) {
                                                                                    if (item.to_info == fnode.tip) {
                                                                                        portal.Jnode.linkValue(kpiVal, item.value, rlink);
                                                                                    }
                                                                                } else if (item.to_info == nodef.tip) {
                                                                                    if (item.from_ip == fnode.tip) {
                                                                                        portal.Jnode.linkValue(kpiVal, item.value, rlink);
                                                                                    }
                                                                                }
                                                                            })
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                                if (nodef.nodeOutlinks.length) {
                                                    for (var j = 0; j < nodef.nodeOutlinks.length; j++) {
                                                        scene.childs.forEach(function(fnode) {
                                                            if (fnode.elementType == "node") {
                                                                if (fnode.tip == nodef.nodeOutlinks[j].nodeZ.tip) {
                                                                    var rlink = newLink(nodef, fnode);
                                                                    $.ajax({
                                                                        url: "/jtopo/getJtopoSys.do",
                                                                        type: "post",
                                                                        data: {
                                                                            "kpi": kpiVal,
                                                                            "start": 0,
                                                                            "end": 0,
                                                                            "lidu": 600
                                                                        },
                                                                        dataType: "json",
                                                                        success: function(system) {
                                                                            system.forEach(function(item) {
                                                                                if (item.from_ip == nodef.tip) {
                                                                                    if (item.to_info == fnode.tip) {
                                                                                        portal.Jnode.linkValue(kpiVal, item.value, rlink);
                                                                                    }
                                                                                } else if (item.to_info == nodef.tip) {
                                                                                    if (item.from_ip == fnode.tip) {
                                                                                        portal.Jnode.linkValue(kpiVal, item.value, rlink);
                                                                                    }
                                                                                }
                                                                            })
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        });
                                                    }
                                                }
                                            } else {
                                                $(".mloadingDiv").removeClass("hide");
                                                //从保存状重新渲染后的释放过程
                                                var enode = newCircleNode(nodef.x - 0, nodef.y - 0);
                                                enode.radius = nodef.radius;
                                                enode.fillColor = nodef.fillColor;
                                                enode.tip = nodef.tip;
                                                enode.inLinks = nodef.inLinks;
                                                enode.outLinks = nodef.outLinks;
                                                portal.Jnode.alarm(enode, nodef.alarmNum);
                                                if (nodef.inLinks) {
                                                    for (var i = 0; i < enode.inLinks.length; i++) {
                                                        scene.childs.forEach(function(fnode) {
                                                            if (fnode.elementType == "node") {
                                                                if (fnode.tip == enode.inLinks[i].nodeAtip) {
                                                                    var rlink = newLink(fnode, enode);
                                                                    $.ajax({
                                                                        url: "/jtopo/getJtopoSys.do",
                                                                        type: "post",
                                                                        data: {
                                                                            "kpi": kpiVal,
                                                                            "start": 0,
                                                                            "end": 0,
                                                                            "lidu": 600
                                                                        },
                                                                        dataType: "json",
                                                                        success: function(system) {
                                                                            system.forEach(function(item) {
                                                                                if (item.from_ip == enode.tip) {
                                                                                    if (item.to_info == enode.tip) {
                                                                                        portal.Jnode.linkValue(kpiVal, item.value, rlink);
                                                                                    }
                                                                                } else if (item.to_info == enode.tip) {
                                                                                    if (item.from_ip == enode.tip) {
                                                                                        portal.Jnode.linkValue(kpiVal, item.value, rlink);
                                                                                    }
                                                                                }
                                                                            })
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        })
                                                    }
                                                }
                                                if (nodef.outLinks) {
                                                    for (var j = 0; j < enode.outLinks.length; j++) {
                                                        scene.childs.forEach(function(fnode) {
                                                            if (fnode.elementType == "node") {
                                                                if (fnode.tip == enode.outLinks[j].nodeZtip) {
                                                                    var rlink = newLink(enode, fnode);
                                                                    $.ajax({
                                                                        url: "/jtopo/getJtopoSys.do",
                                                                        type: "post",
                                                                        data: {
                                                                            "kpi": kpiVal,
                                                                            "start": 0,
                                                                            "end": 0,
                                                                            "lidu": 600
                                                                        },
                                                                        dataType: "json",
                                                                        success: function(system) {
                                                                            system.forEach(function(item) {
                                                                                if (item.from_ip == enode.tip) {
                                                                                    if (item.to_info == enode.tip) {
                                                                                        portal.Jnode.linkValue(kpiVal, item.value, rlink);
                                                                                    }
                                                                                } else if (item.to_info == enode.tip) {
                                                                                    if (item.from_ip == enode.tip) {
                                                                                        portal.Jnode.linkValue(kpiVal, item.value, rlink);
                                                                                    }
                                                                                }
                                                                            })
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        })
                                                    }

                                                }
                                            }
                                        });
                                        scene.remove(event.target);
                                        setTimeout(function() {
                                            $(".mloadingDiv").addClass("hide");
                                        }, 600)
                                    } else {
                                        $(".mloadingDiv").removeClass("hide");
                                        if(event.target.tip.indexOf("/") != -1){
                                            //找到有带“/”的字符
                                            //console.log(event.target.relAy);
                                            var eRel = event.target.relAy;
                                            for(var v in eRel) {
                                                //console.log(v);
                                                if (v != "del") {
                                                    var eRelNode = newCircleNode(event.target.x, event.target.y, v, "255,255,255", event.target.alarmNum);
                                                    portal.Jnode.alarm(eRelNode, eRelNode.alarmNum);
                                                    for (var j = 0; j < eRel[v].length; j++) {
                                                        scene.childs.forEach(function (item) {
                                                            if (item.elementType == "node") {
                                                                if (eRel[v][j] == item.tip) {
                                                                    var eRlink = newLink(eRelNode, item);
                                                                }
                                                            }
                                                        })
                                                    }
                                                }
                                            }
                                            scene.remove(event.target);
                                            setTimeout(function(){
                                                $(".mloadingDiv").addClass("hide");
                                            },60);
                                        }else{
                                            $.ajax({
                                                url: "/jtopo/getJtopoSysIp.do",
                                                type: "post",
                                                data: {
                                                    "ip": event.target.tip,
                                                    "kpi": thisOption,
                                                    "start": 0,
                                                    "end": 0,
                                                    "lidu": 600
                                                },
                                                dataType: "json",
                                                success: function(search) {
                                                    //console.log(search);
                                                    var beginTime = (new Date()).getTime();
                                                    if (search.length) {
                                                        scene.clear();
                                                        switch (search[0].type){
                                                            case "server":
                                                                var color = "7,237,15";
                                                                break;
                                                            case "client":
                                                                var color = "255,255,255";
                                                                break;
                                                        }
                                                        var searchNode = newCircleNode(parseInt(window.innerWidth * 0.7),
                                                            parseInt((window.innerHeight - $(".navbar-logo ").height() - 20) * 0.3),
                                                            event.target.tip, color);
                                                        searchNode.radius = 8;
                                                        portal.Jnode.alarm(searchNode, search[0]["from_alarm"]);
                                                        var portNodeArray = [];
                                                        search.forEach(function(item, index) {
                                                            var portNode = newCircleNode(undefined, undefined, item.port, "102,204,255");
                                                            portal.Jnode.alarm(portNode, item.to_alarm);
                                                            portNode.radius = 8;
                                                            var ilink = newLink(searchNode, portNode);
                                                            ilink.lineWidth = 2;
                                                            portal.Jnode.linkValue(thisOption, item.value, ilink);
                                                            JTopo.layout.layoutNode(scene, searchNode, true);
                                                        });
                                                        $(".mloadingDiv").addClass("hide");
                                                        flag = 1;
                                                        $("button[name='center']").removeClass("hide");
                                                        $("button[name='save']").removeClass("hide");
                                                        $("button[name='export_image']").removeClass("hide");
                                                        $(".showCenter").addClass("hide");
                                                    } else {
                                                        $(".mloadingDiv").addClass("hide");
                                                        $(".addOption").parent().addClass("hide");
                                                        // 弹出框提示IP不存在
                                                        $(".modal-body-div").text("您查询的IP未找到").removeClass("hide");
                                                        $(".f-click").hide();
                                                        $("#myModal").modal('show');
                                                    }
                                                }
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }();
        }
    });
    // 拖动工具栏
    (function() {
        var move = false; // 移动标记
        var _x, _y; // 鼠标离控件左上角的相对位置
        $("div[name='topo_toolbar']").mousedown(function(e) {
            move = true;
            //_x=e.pageX-parseInt($("div[name='topo_toolbar']").css("left"));
            _x = window.innerWidth - e.pageX - parseInt($("div[name='topo_toolbar']").css("right"));
            _y = e.pageY - parseInt($("div[name='topo_toolbar']").css("top"));
        });
        $(document).mousemove(function(e) {
            if (move) {
                //var x=e.pageX-_x;//控件左上角到屏幕左上角的相对位置
                var x = window.innerWidth - e.pageX - _x; // 控件右上角到屏幕右上角的相对位置
                var y = e.pageY - _y;
                $("div[name='topo_toolbar']").css({
                    "top": y,
                    "right": x
                });
            }
        }).mouseup(function() {
            move = false;
        });
    }());
    $('#myModal').on('shown.bs.modal', function() {
        $(window).keydown(function(event) {
            if (event.keyCode == 13) {
                $(".t-click").click();
            }
        });
    });
    /* center modal */
    function centerModals(){
        $('.modal').each(function(i){
            var $clone = $(this).clone().css('display', 'block').appendTo('body');
            var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
            top = top > 0 ? top : 0;
            $clone.remove();
            $(this).find('.modal-content').css("margin-top", top);
        });
    }
    $('.modal').on('show.bs.modal', centerModals);
    $(window).on('resize', centerModals);
    $('[data-toggle="tooltip"]').tooltip(); // 弹出bootstrap提示框
    $(window).resize(function() {
        $("#canvas").attr({
            "width": $(".navbar-logo").width(),
            "height": window.innerHeight - $(".navbar-logo").height()
        }); // 对canvas宽高的自适应
        $(".mloadingDiv").height(window.innerHeight);
        $(".loadingDivChild").css({
            "left": (window.innerWidth - $(".loadingDivChild").width()) / 2,
            "top": (window.innerHeight - $(".loadingDivChild").height()) / 2
        }); // 对提示用户的自适应
    });
});