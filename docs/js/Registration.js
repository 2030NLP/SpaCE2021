
LC.init({
    appId: "waUVgegbKQOGtRrF9lQE7PxE-gzGzoHsz",
    appKey: "xtNzqqnb2GmOqXFTsCXADjn9",
    serverURL: "https://wauvgegb.lc-cn-n1-shared.com",
});
const Team = LC.CLASS("Team");
const HappyTeam = LC.CLASS("TeamAgain");

AV.init({
    appId: "waUVgegbKQOGtRrF9lQE7PxE-gzGzoHsz",
    appKey: "xtNzqqnb2GmOqXFTsCXADjn9",
    serverURL: "https://wauvgegb.lc-cn-n1-shared.com",
});
const TeamQuery = new AV.Query("Team");




var the_vue = new Vue({
    el: '#bodywrap',
    data: {
        "ui": {
            // current_page: 'temporary',
            modal_open: 0,
            modal_type: 'G',
            nav_collapsed: 1,
            alerts_last_idx: 1,
            alerts: [],
        },
        "submission_succeeded": false,
        "form": {
            team_name: "",
            team_type: "",
            institution: "",
            institution2: "",
            group: "",
            people: "",
            leader: "",
            card_id: "",
            card_type: "身份证",
            phone: "",
            email: "",
            agree: false,
        },
        "history": [],
        "qr": null,
        //
    },
    computed: {
        user_agent: function() {
            return navigator.userAgent;
        },
        // ip: function() {
        //     return getIP();
        // },
        check_all: function() {
            return this.check_team_name &&
            this.check_team_type &&
            this.check_institution &&
            this.check_people &&
            this.check_leader &&
            this.check_card_id &&
            this.check_card_type &&
            this.check_phone &&
            this.check_email &&
            this.form.agree;
        },
        check_team_name: function() {
            return this.form.team_name && this.form.team_name.length <= 10;
        },
        check_team_type: function() {
            return this.form.team_type && this.form.team_type != "【请选择】";
        },
        check_institution: function() {
            return this.form.institution;
        },
        check_people: function() {
            return this.form.people.split('，').length <= 10;
        },
        check_leader: function() {
            return this.form.leader;
        },
        check_card_id: function() {
            return this.form.card_id;
        },
        check_card_type: function() {
            return this.form.card_type;
        },
        check_phone: function() {
            let x = this.form.phone.match(/\d{11}/);
            return x && x[0] == this.form.phone;
        },
        check_email: function() {
            let x = this.form.email.match(/[^ ]+@[^ ]+\.[^ ]+/);
            return x && x[0] == this.form.email;
        },
    },


    methods: {
        submitIt() {
            let self = this;
            console.log(self.form);
            TeamQuery.equalTo('team_name', self.form.team_name);
            let shouldSubmit = false;
            TeamQuery.find()
                .then((x)=>{
                    if (x.length > 0) {
                        console.log(x);
                        self.push_alert('danger', '抱歉，队名已经被别人使用，请重新取一个队名吧！');
                        self.form.team_name = "";
                    } else {
                        shouldSubmit = true;
                    };
                    if (shouldSubmit) {
                        Team.add(self.form)
                            .then(() => {
                                self.push_alert('info', '正在提交，请稍等……');
                                let thing = self.form;
                                thing.checked1 = false;
                                thing.checked2 = false;
                                HappyTeam.add(self.form)
                                .then(() => {
                                    self.push_alert('success', '提交成功！');
                                    self.submission_succeeded = true;
                                    self.history.push(self.form);
                                }).catch(({ error }) => self.push_alert('danger', error));
                            })
                            .catch(({ error }) => self.push_alert('danger', error));
                    }; // else {self.push_alert('danger', '出了点问题…')};
                })
                .then(()=>{
                    self.qr = self.qr ?? new QRCode(document.getElementById("qrcode"), "https://weixin.qq.com/g/AQYAAPLZlmUTp5hQzmrFYx2Pd0-xXFEefY7w1lH2mh8FVPEQwrMRaBQKdn_A1cDP");
                })
                .catch(({ error }) => self.push_alert('danger', error));
        },
        reset() {
            let self = this;
            self.submission_succeeded = false;
            self.form = {
                team_name: "",
                team_type: "",
                institution: "",
                institution2: "",
                group: "",
                people: "",
                leader: "",
                card_id: "",
                card_type: "身份证",
                phone: "",
                email: "",
                agree: false,
            };
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
            if (window.localStorage['form']) {
                self.form = JSON.parse(window.localStorage['form']);
            };
            if (window.localStorage['submission_succeeded']) {
                self.submission_succeeded = JSON.parse(window.localStorage['submission_succeeded']);
            };
            if (window.localStorage['history']) {
                self.history = JSON.parse(window.localStorage['history']);
            };
        },

        saveDataToLocalStorage: function() {
            let self = this;
            if(window.localStorage){
                window.localStorage['form'] = JSON.stringify(self.form);
                window.localStorage['submission_succeeded'] = JSON.stringify(self.submission_succeeded);
                window.localStorage['history'] = JSON.stringify(self.history);
            };
        },

    },
    // created() {
    //     let self = this;
    //     self.readDataFromLocalStorage();
    // },
    mounted() {
        let self = this;
        self.readDataFromLocalStorage();
        if (self.submission_succeeded) {
            self.qr = new QRCode(document.getElementById("qrcode"), "https://weixin.qq.com/g/AQYAAPLZlmUTp5hQzmrFYx2Pd0-xXFEefY7w1lH2mh8FVPEQwrMRaBQKdn_A1cDP");
        };
    },
    updated() {
        let self = this;
        self.saveDataToLocalStorage();
        // if (self.submission_succeeded) {
        //     self.qr = new QRCode(document.getElementById("qrcode"), "https://weixin.qq.com/g/AQYAAPLZlmUTp5hQzmrFYx2Pd0-xXFEefY7w1lH2mh8FVPEQwrMRaBQKdn_A1cDP");
        // };
    },
    // beforeDestroyed() {
    //     let self = this;
    // },

});

