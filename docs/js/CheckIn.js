
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
        "fields": ['worker', 'logged_in', 'has_power', 'teams', 'happy_teams'],
        "worker": "",
        "confirm_link": "xxx",
        "signal": "",
        "ui": {
            // current_page: 'temporary',
            modal_open: 0,
            modal_type: 'G',
            nav_collapsed: 1,
            alerts_last_idx: 1,
            alerts: [],
        },
        "logged_in": false,
        "has_power": false,
        "teams": [],
        "happy_teams": [],
        "letter": "",
        "letter_title": "",
        "letter_to": {},
        //
    },
    computed: {
        user_agent: function() {
            return navigator.userAgent;
        },
    },


    methods: {

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
            LC.User.login('pku', self.signal).then((x) => {
                self.push_alert('success', `${self.worker}你好！`);
                self.logged_in = true;
                self.signal = "";
                self.has_power = (LC.User.current() && (LC.User.current().data.username=="pku"));
                self.refresh();
            }).catch(({ error }) => self.push_alert('danger', error));
        },

        logOut: function() {
            let self = this;
            LC.User.logOut();
            self.signal = "";
            self.logged_in = false;
            self.push_alert('success', `再见${self.worker}！`);
            self.refresh();
        },

        write: function(team) {
            let self = this;
            self.letter_to = team;
            let nn = team.people.split('，').length;
            let mm = nn > 1;
            self.letter_title = `【SpaCE2021】请确认「${team.team_name}」队伍报名信息`;
            self.letter = `尊敬的 ${team.leader} 先生/女士${mm?'及队员们':''}：
　　${mm?'你们':'您'}好！
　　我们是“CCL2021中文空间语义理解评测(SpaCE2021)”赛事的工作人员，现在已经收到了${mm?'你们':'您'}的报名信息。请检查：

　　　　队名：${team.team_name}
　　　　来源：${team.team_type}
　　　　队长：${team.leader}
　　　　队员：${team.people}
　　　　邮箱：${team.email}
　　　　手机：${team.phone}
　　　　单位：${team.institution}
　　　　单位简称：${team.institution2}
　　　　子团体：${team.group}
　　　　证件类型：${team.card_type}
　　　　证件号码：${team.card_id}

　　如果存在问题，请回复邮件与我们联系。
　　如果没有问题，请访问 ${self.confirm_link} 进行确认。谢谢！

From CCL2021中文空间语义理解评测委员会`;
        },

        written: function() {
            let self = this;
            self.letter_title = "";
            self.letter = "";
            let team = self.letter_to;
            HappyTeam.object(team.objectId).get().then((x)=>{
                x.update({'checked1': true, 'checked_by': self.worker, });
                // the_vue.push_alert('info', x);
                self.refresh();
            }).catch(({ error }) => self.push_alert('danger', error));
            self.letter_to = {};
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
        if (LC.User.current()) {
            self.logged_in = true;
            self.push_alert('success', `${self.worker}你好，欢迎回来！`);
            // self.refresh();
        };
        self.refresh();
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

