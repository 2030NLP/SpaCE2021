
const KEYs = {
    appId: "waUVgegbKQOGtRrF9lQE7PxE-gzGzoHsz",
    appKey: "xtNzqqnb2GmOqXFTsCXADjn9",
    serverURL: "https://wauvgegb.lc-cn-n1-shared.com",
};

LC.init(KEYs);
const Team = LC.CLASS("Team");
const AnswerSheet = LC.CLASS("AnswerSheet");

function answerEncode(str) {
    let str2 = `1${str}`;
    let x = str2.length % 35;
    let str3 = `${'0'.repeat(35-x)}${str2}`;
    // console.log(str3.length % 35);
    let ll_ = [];
    for (let ii=0; ii<=str3.length / 35; ii++) {
        ll_.push(str3.slice(ii*35, ii*35+35));
    };
    let lll_ = [];
    ll_.forEach(x => {if(x!=""){lll_.push(parseInt(x, 2).toString(36))}});
    // console.log(ll_);
    // console.log(lll_);
    return lll_.join("-");
}

function answerDecode(str) {
    let lll_ = str.split("-");
    let ll_ = [];
    lll_.forEach(x => ll_.push(parseInt(x, 36).toString(2)));
    let x = ll_[0].length % 35;
    // ll_[0] = `${'0'.repeat(35-x)}${ll_[0]}`;
    let str2 = ll_.join("");
    let str_ = str2.slice(1, str2.length);
    return str_;
}

var the_vue = new Vue({
    el: '#bodywrap',
    data: {
        "form": {
            team_name: "",
            email: "",
        },
        "submitted": false,
        "submit_history": [],
        //
        // "sheet": "",
        "sheet_data": null,
        "sheet1": "",
        "sheet2": "",
        "sheet3": "",
        "sheet_obj": {},
        //
        //
        "which_set": 1,
        "which_set_map": ['train', 'dev', 'test'],
        "set_length_maps": {
            'sheet1-dev': 806,
            'sheet2-dev': 2088,
            'sheet3-dev': 1203,
            'sheet1-test': 794,
            'sheet2-test': 1952,
            'sheet3-test': 1167,
        },
        "solution": 1,
        "fields": ["form", "submit_history", "submitted"],
        "ui": {
            modal_open: 0,
            nav_collapsed: 1,
            alerts_last_idx: 1,
            alerts: [],
        },
        "files": [],
        // "reader": new FileReader(),
        //
    },
    computed: {
        user_agent: function() {
            return navigator.userAgent;
        },
        check_basic: function() {
            let self = this;
            return self.sheet1 && self.sheet2 && self.sheet3 && self.which_set==1;
        },
    },


    methods: {
        check_all: function() {
            let self = this;
            return self.sheet && self.which_set==1;
        },

        check_sheet() {
            let self = this;
            let data = null;
            try {
                data = JSON.parse(self.sheet);
                self.push_alert('info', '数据解析成功。');
                self.sheet_data = data;
                return self.check_sheet_data(data);
            } catch(error1) {
                self.push_alert('info', error1);
                self.push_alert('info', 'JSON.parse()方法解析数据失败，开始尝试eval()方法……');
                try {
                    // data = eval(self.sheet);
                    eval(`data = ${self.sheet}`);
                    self.push_alert('info', '数据解析成功。');
                    self.sheet_data = data;
                    return self.check_sheet_data(data);
                } catch(error2) {
                    self.push_alert('danger', error2);
                    self.push_alert('danger', '数据解析失败，请检查数据格式！');
                    return false;
                };
            };
        },

        check_sheet_data(data) {
            let self = this;
            let set_name = new Map([
                [1, 'dev'],
                [2, 'test'],
            ]);
            let conds = [];
            for (let i of [1, 2, 3]) {
                conds.push(`subtask${i}-${set_name.get(self.which_set)}` in data);
            };
            let result = conds[0] && conds[1] && conds[2];
            if (!result) {
                self.push_alert('danger', '数据缺少必要字段，请检查数据格式！');
                return result;
            };
            return result;
        },

        onImport: function() {
            let self = this;
            self.sheet1 = "";
            self.sheet2 = "";
            self.sheet3 = "";
            //
            let fileList = document.forms["file-form"]["file-input"].files;
            for (let file of fileList) {
                let file_ = {};
                file_.obj = file;
                file_.name = file.name;
                file_.isUsable = true;
                file_.readed = false;
                self.files.push(file_);
                // self.readFile(file);
            };
        },
        readFiles:function() {
            let self = this;
            // self.sheet_obj = {};
            for (let file of self.files) {
                self.readFile(file);
            };
        },
        readFile: function(file) {
            let self = this;
            let file_content = null;
            let reader = new FileReader();
            // let reader = self.reader;
            reader.readAsText(file.obj, "utf-8");
            reader.onload = function(evt) {
                try {
                    file_content = JSON.parse(this.result);
                    if (Array.isArray(file_content)) {
                        let _sheet = self.sheet_obj;
                        let _methods = {
                            1: (x) => `${0+x.judge1}`,
                            2: (x) => `${0+x.judge2}`,
                            3: (x) => `${0+x.judge1}${0+x.judge2}`,
                        };
                        file_content = JSON.parse(this.result);
                        try {
                            for (let item of file_content) {
                                let [task_id, set_type, item_id] = item.qID.split('-');
                                let key = `subtask${task_id}-${set_type}`;
                                if (set_type == 'dev' || set_type == 'val' || set_type == 'test') {
                                    if (!(key in _sheet)) {
                                        _sheet[key] = [];
                                    };
                                    _sheet[key][item_id] = _methods[task_id](item);
                                };
                            };
                            // console.log(_sheet);
                        } catch(error) {
                            self.push_alert('danger', `文件「${file.name}」读取失败。（${error}）`);
                        };
                    } else {
                        self.push_alert('danger', `文件「${file.name}」读取失败。（内容无法解析为列表）`);
                    };
                } catch(error) {
                    self.push_alert('danger', `文件「${file.name}」读取失败。（${error}）`);
                };
                file.readed = true;
            };
        },

        trans: function() {
            let self = this;
            self.beforeSubmit_1();
        },
        beforeSubmit_1: function() {
            let self = this;
            for (let file of self.files) {
                if (!file.readed) {
                    self.push_alert('danger', `文件「${file.name}」尚未解析成功。`);
                    return false;
                };
            };
            for (let i of [1, 2, 3]) {
                let kk = `subtask${i}-${self.which_set_map[self.which_set]}`;
                if (!(kk in self.sheet_obj)) {
                    self.push_alert('danger', `解析后的数据缺少必要字段「${kk}」。`);
                    return false;
                };
                self[`sheet${i}`] = self.sheet_obj[kk].join('');
            };
            return true;
        },
        beforeSubmit_2: function() {
            let self = this;
            return true;
        },

        submitIt: function() {
            let self = this;
            let cc = false;
            switch (self.solution) {
                case 1:
                    cc = self.beforeSubmit_1();
                    break;
                case 2:
                    cc = self.beforeSubmit_2();
                    break;
            };
            if(! cc) {
                self.push_alert('info', `提交中止。`);
                return false;
            };
            for (let ii of [1, 2, 3]) {
                let aa = self.set_length_maps[`sheet${ii}-${self.which_set_map[self.which_set]}`];
                let bb = self[`sheet${ii}`].length;
                bb = ii==3? bb/2 : bb;
                if (bb != aa) {
                    self.push_alert('danger', `提交中止：子任务${ii}应有${aa}题，但解析结果含有${bb}题，请检查。`);
                    return false;
                };
                if (answerDecode(answerEncode(self[`sheet${ii}`])) != self[`sheet${ii}`]) {
                    self.push_alert('danger', `提交中止：数据编码函数存在问题，请与主办方联系（ sc_eval@163.com ），给您带来不便非常抱歉！`);
                    return false;
                };
            };
            self.push_alert('info', `提交继续。`);
            if (self.check_all) {
                Team.where('team_name','==',the_vue.form.team_name)
                    .where('email','==',the_vue.form.email)
                    .find().then((x)=>{
                        if (x.length==1) {
                            AnswerSheet.add({
                                team: x[0],
                                sheet1: answerEncode(self.sheet1),
                                sheet2: answerEncode(self.sheet2),
                                sheet3: answerEncode(self.sheet3),
                                which_set: parseInt(self.which_set),
                            }).then((x)=>{
                                self.push_alert('success', `提交成功！`);
                                self.submitted = true;
                                self.submit_history.push({
                                    team_name: self.form.team_name,
                                    time: new Date(),
                                    which_set: parseInt(self.which_set),
                                });
                            }).catch(({ error }) => self.push_alert('danger', error));
                        } else {
                            self.push_alert('danger', '无法找到匹配的队伍，请检查队名或邮箱！');
                        };
                    }).catch(({ error }) => self.push_alert('danger', error));
            } else {self.push_alert('danger', '存在异常，请检查：1、数据格式是否有问题；2、现阶段只接受dev集结果。');};
            //
        },
        reset() {
            let self = this;
            self.submitted = false;
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

        deleteFile(file) {
            let self = this;
            file.isUsable = false;
            self.files = self.files.filter(x=>x.isUsable);
            self.files.forEach(x => x.readed=false);
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
        // self.logIn();
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

