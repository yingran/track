(function(){
    
    var debug = true,
        host = 'js.example.com',
        compress = 0;
        
    var url, tag;

    if (debug){
        url = 'http://' + host +':8085/' + $config.project +'/' + $config.page + '.js?c=' + compress;
    } else {
        url = 'http://' + host +'/' + $config.project +'/js/min/' + $config.page + '.js';
    }
    
    tag = '<script type="text/javascript" src="' + url + '" ></script>';
    //处理依赖处理问题导致部分资源可能加载不全的情况
    document.write('<script type="text/javascript" src="http://' + host + '/public/yui/yui/yui-min.js" ></script>');
    document.write(tag);
})();
