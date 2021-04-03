
const KEYs = {
    appId: "waUVgegbKQOGtRrF9lQE7PxE-gzGzoHsz",
    appKey: "xtNzqqnb2GmOqXFTsCXADjn9",
    serverURL: "https://wauvgegb.lc-cn-n1-shared.com",
};

LC.init(KEYs);
const Team = LC.CLASS("Team");
const HappyTeam = LC.CLASS("TeamAgain");

// AV.init(KEYs);
// const TeamQuery = new AV.Query("Team");
// const HappyTeamQuery = new AV.Query("HappyTeam");

var the_vue = new Vue({
    el: '#bodywrap',
    data: {
        "form": {
            team_name: "",
            email: "",
        },
        "confirmed": false,
        "confirm_history": [],
        //
        "fields": ["form", "confirm_history", "confirmed"],
        "ui": {
            modal_open: 0,
            nav_collapsed: 1,
            alerts_last_idx: 1,
            alerts: [],
        },
        //
    },
    computed: {
        user_agent: function() {
            return navigator.userAgent;
        },
        check_all: function() {
            return true;
        },
    },


    methods: {

        submitIt: function() {
            let self = this;
            HappyTeam.where('team_name','==',the_vue.form.team_name)
                .where('email','==',the_vue.form.email)
                .find().then((x)=>{
                    if (x.length==1) {
                        // self.push_alert('info', '是的！');
                        x[0].update({'checked2': true}).then((x)=>{
                            self.push_alert('info', `请稍后`);
                            //
                            Team.where('team_name','==',the_vue.form.team_name)
                                .where('email','==',the_vue.form.email)
                                .find().then((x)=>{
                                    if (x.length==1) {
                                        // self.push_alert('info', '是的！');
                                        x[0].update({'verified': true}).then((x)=>{
                                            self.push_alert('success', `验证成功！`);
                                            //
                                            //
                                            self.confirmed = true;
                                            self.confirm_history.push(self.form);
                                            self.form = {team_name: "", email: "",};
                                        }).catch(({ error }) => self.push_alert('danger', error));
                                    } else {
                                        self.push_alert('danger', '队名或邮箱存在错误，无法匹配报名信息！');
                                    };
                                }).catch(({ error }) => self.push_alert('danger', error));
                            //
                        }).catch(({ error }) => self.push_alert('danger', error));
                    } else {
                        self.push_alert('danger', '队名或邮箱存在错误，无法匹配报名信息！');
                    };
                }).catch(({ error }) => self.push_alert('danger', error));
        },
        reset() {
            let self = this;
            self.confirmed = false;
            self.form = {team_name: "", email: "",};
        },

        refresh: function() {
            let self = this;
            self.teams = [];
            self.happy_teams = [];
            if (self.logged_in && self.has_power) {
                HappyTeam.find().then((x) => {
                    console.log(x);
                    x.forEach((y) => {
                        let rr = y.data;
                        rr.objectId = y.objectId;
                        self.happy_teams.push(rr);
                    });
                }).catch(({ error }) => self.push_alert('danger', error));
            } else {
                Team.find().then((x) => {
                    console.log(x);
                    x.forEach((y) => {
                        self.teams.push(y.data);
                    });
                }).catch(({ error }) => self.push_alert('danger', error));
            };
        },

        logIn: function() {
            let self = this;
            LC.User.login('i', 'i').then((x) => {
                self.push_alert('success', `成功连接服务器，请继续操作。`);
                self.logged_in = true;
                // self.refresh();
            }).catch(({ error }) => self.push_alert('danger', error));
        },

        logOut: function() {
            let self = this;
            LC.User.logOut();
            self.signal = "";
            self.logged_in = false;
            self.push_alert('success', `再见${self.worker}！`);
            // self.refresh();
        },

        toggle_modal: function(type) {
            this.ui.modal_type = type;
            this.ui.modal_open = 1 - this.ui.modal_open;
        },
        push_alert: function(cls, ctt) {
            console.log([cls, ctt]);
            let idx = this.ui.alerts_last_idx+1;
            this.ui.alerts.push({
                'idx': idx,
                'class': cls,
                'html': ctt,
                'show': 1,
            });
            this.ui.alerts_last_idx += 1;
            let that = this;
            setTimeout(function(){that.remove_alert(idx);},6000)
        },
        remove_alert: function(idx) {
            this.ui.alerts.filter(alert => alert.idx==idx)[0].show = 0;
        },

        readDataFromLocalStorage: function() {
            let self = this;
            for (let field of self.fields) {
                if (window.localStorage[field]) {
                    self[field] = JSON.parse(window.localStorage[field]);
                };
            };
        },

        saveDataToLocalStorage: function() {
            let self = this;
            if(window.localStorage){
                for (let field of self.fields) {
                    window.localStorage[field] = JSON.stringify(self[field]);
                };
            };
        },

    },
    created() {
        let self = this;
        self.readDataFromLocalStorage();
        if (LC.User.current() && (LC.User.current().data.username!="i")) {
            let who = LC.User.current().data.username;
            LC.User.logOut();
            self.push_alert('info', `Hi!`);
            // self.refresh();
        };
        self.logIn();
        // self.refresh();
    },
    updated() {
        let self = this;
        self.has_power = (LC.User.current() && (LC.User.current().data.username=="pku"));
        self.saveDataToLocalStorage();
    },
    // beforeDestroyed() {
    //     let self = this;
    // },

});

