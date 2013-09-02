
YUI.add('module.hello', function(Y) {
    
    Hello = {};
    
    
   
    
/***********************************************Model***************************************************/
    
    //定义一个扩展Y.Model的类Hello.User
    Hello.User = Y.Base.create(
        
        'Hello.User', //类名称
        
        Y.Model,    //扩展自Y.Model
        
        [],
        
        {
            'reNick': function(val){
                var result = this.set('nick',val);
                result = result;
            },
            'reGender': function(val){
                this.set('gender',val);
            }
        },
        
        {   //静态属性
            
            ATTRS: {
                'type': {
                    value: '普通',
                    readOnly: true
                },
                'id':{
                    value: '',
                    writeOnce: true     //实例生成后不得再更改
                },
                'gender':{
                    value: '男',
                    validator: function(val, name){
                        return /^[男女]$/.test(val);
                    }
                    
                },
                'nick':{
                    value: '',
                    validator: function(val, name){
                        return /^[A-Za-z_]\w+$/gi.test(val);
                    }
                }
            }
    });
    
    
    
   
/***********************************************View***************************************************/

    //定义一个表现层模块
    Hello.View = Y.Base.create('Hello.View',Y.View,[],
        {
            
            template: [
                '用户id：{id}<br/>',
                '用户昵称：{nick}<br/>',
                '用户性别：{gender}'
            ].join(''),
            
            initializer: function () {
                
                this.after('modelChange', function(){
                    var model = this.get('model');
                
                    model.after('change', this.render, this);
                    model.after('destroy', this.destroy, this);
                });
            },
            
            render: function () {
                var container = this.get('container'),
                    html      = Y.Lang.sub(this.template, this.get('model').toJSON());

                container.setHTML(html);
            }
        },
        {
            ATTRS: {
                container: {
                    valueFn: function(val){
                        return Y.Node.one(val);
                    }
                }
            }
        }
        
    );
    
    //定义一个扩展自Hello.View的表现层模块
    Hello.View2 = Y.Base.create('Hello.View',Hello.View,[],
        {
            events: {
                'input.reNick': {
                    click: 'reNick'
                },
                'input.reGender': {
                    click: 'reGender'
                }
            },
            
            template: [
                '用户id：{id}<br/>',
                '用户昵称：<input type="text" class="input-nick" value="{nick}" /><input type="button" class="reNick" value="更改" /><br/>',
                '用户性别：<input type="text" class="input-gender" value="{gender}" /><input type="button" class="reGender" value="更改" />'
            ].join(''),
            
            reNick: function(evt){
                var nick = evt.target.get('parentNode').one('input.input-nick').get('value');
                this.get('model').reNick(nick);
            },
            
            reGender: function(evt){
                var gender = evt.target.get('parentNode').one('input.input-gender').get('value');
                this.get('model').reGender(gender);
            }
        },
        {}
        
    );
    
    Module.Hello = Hello;
                    



}, '3.11.0' ,{requires:['module.base', 'model', 'view']});
