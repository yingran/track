        
YUI().use('node', 'module.hello', function(Y){
    
    var Hello = Module.Hello;
    
    
    var u1 = new Hello.User({'id': '001'});
    
    var v1 = new Hello.View({
        container: '#container1'
    });
    
    var v2 = new Hello.View2({
        container: '#container2'
    });
    
    v1.set('model', u1);
    v2.set('model', u1);
    
    v1.render();
    v2.render();
    


});
