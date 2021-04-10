
const KEYs = {
    appId: "waUVgegbKQOGtRrF9lQE7PxE-gzGzoHsz",
    appKey: "xtNzqqnb2GmOqXFTsCXADjn9",
    serverURL: "https://wauvgegb.lc-cn-n1-shared.com",
};

LC.init(KEYs);
const Score = LC.CLASS("Score");





// @numbers 包含所有数字的一维数组
// @digit 保留数值精度小数位数，默认两位小数
function foo(numbers, digit = 6) {
    // 修复js浮点数精度误差问题
    const formulaCalc = function formulaCalc(formula, digit) {
        let pow = Math.pow(10, digit);
        return parseInt(formula * pow, 10) / pow;
    };
    let len = numbers.length;
    if (len==0) {
        return {std: 0, mean: 0};
    };
    let sum = (a, b) => formulaCalc(a + b, digit);
    let max = Math.max.apply(null, numbers);
    let min = Math.min.apply(null, numbers);
    // 平均值
    let avg = numbers.reduce(sum) / len;
    // 计算中位数
    // 将数值从大到小顺序排列好，赋值给新数组用于计算中位数
    let sequence = [].concat(numbers).sort((a,b) => b-a);
    let mid = len & 1 === 0 ?
        (sequence[len/2] + sequence[len/2+1]) / 2 :
        sequence[(len+1)/2];
    // 计算标准差
    // 所有数减去其平均值的平方和，再除以数组个数（或个数减一，即变异数）再把所得值开根号
    let stdDev = Math.sqrt(numbers.map(n=> (n-avg) * (n-avg)).reduce(sum) / len);
    return {
        // max,
        // min,
        // mid: parseFloat(mid).toFixed(digit),
        std: stdDev.toFixed(digit),
        mean: avg.toFixed(digit),
    };
}

function zScore(xx, mean, std, digit = 6) {
    // 修复js浮点数精度误差问题
    const formulaCalc = function formulaCalc(formula, digit) {
        let pow = Math.pow(10, digit);
        return parseInt(formula * pow, 10) / pow;
    };
    return parseFloat(formulaCalc((xx-mean)/std, digit).toFixed(digit));
}


var the_vue = new Vue({
    el: '#bodywrap',
    data: {
        "app_name": "SpaCE2021-Leaderboard",
        "fields": ['scores'],
        //
        "scores": [],
        "final_dict": {"1": {}, "2": {}, },
        "ss": {
            "1": {"1": [], "2": [], "3": [], },
            "2": {"1": [], "2": [], "3": [], },
        },
        "zs": {
            "1": {"1": [], "2": [], "3": [], },
            "2": {"1": [], "2": [], "3": [], },
        },
        //
        "which_set_map": ['train', 'dev', 'test'],
        //
        "ui": {
            nav_collapsed: 1,
            alerts_last_idx: 1,
            alerts: [],
        },
        //
    },
    computed: {
    },


    methods: {
        update_zs: function() {
            let self = this;
            let ss = self.ss;
            self.zs = {
                "1": {"1": foo(ss["1"]["1"]), "2": foo(ss["1"]["2"]), "3": foo(ss["1"]["3"]), },
                "2": {"1": foo(ss["2"]["1"]), "2": foo(ss["2"]["2"]), "3": foo(ss["2"]["3"]), },
            };
        },

        refresh: async function() {
            let self = this;
            self.scores = [];
            self.ss = {"1": {"1": [], "2": [], "3": [], }, "2": {"1": [], "2": [], "3": [], }, };
            //
            if (1) {
                return Score.find()
                .then((x)=>{
                    x.forEach(xx=>{
                        let data = xx.data;
                        let da = {
                            team_name: data.team_name,
                            institution: data.institution,
                            which_set: data.which_set,
                            task1_Acc: data.performance.task1.Accuracy,
                            task2_Acc: data.performance.task2.Accuracy,
                            task3_F1: data.performance.task3.F1,
                            submittedAt: data.submittedAt,
                        };
                        self.scores.push(da);
                        self.ss[da.which_set][1].push(da.task1_Acc);
                        self.ss[da.which_set][2].push(da.task2_Acc);
                        self.ss[da.which_set][3].push(da.task3_F1);
                    });
                    // self.push_alert('info', `成功读取排行榜。`);
                })
                .then(()=>{
                    // self.push_alert('info', `开始初步计算排名……`);
                    self.update_zs();
                    self.scores.forEach(da=>{
                        let p1 = self.zs[`${da.which_set}`]["1"];
                        let p2 = self.zs[`${da.which_set}`]["2"];
                        let p3 = self.zs[`${da.which_set}`]["3"];
                        console.log([p1, p2, p3]);
                        da.task1_Z = zScore(da.task1_Acc, p1.mean, p1.std);
                        da.task2_Z = zScore(da.task2_Acc, p2.mean, p2.std);
                        da.task3_Z = zScore(da.task3_F1, p3.mean, p3.std);
                        da.Z_mean = foo([da.task1_Z, da.task2_Z, da.task3_Z]).mean;
                    });
                    self.scores.sort((a, b)=>{return b.Z_mean - a.Z_mean});
                    //
                    // self.push_alert('info', `开始剔除非最佳成绩……`);
                    self.final_dict = {"1": {}, "2": {}, };
                    let final_dict = self.final_dict;
                    let final_scores = {"1": [], "2": [], };
                    self.ss = {"1": {"1": [], "2": [], "3": [], }, "2": {"1": [], "2": [], "3": [], }, };
                    self.scores.forEach(da=>{
                        if (da.team_name in final_dict[`${da.which_set}`]) {
                            self.push_alert('warning', `「${da.team_name}」的非最佳成绩被排除。`);
                        } else {
                            final_dict[`${da.which_set}`][da.team_name] = da;
                            final_scores[`${da.which_set}`].push(da);
                            self.ss[da.which_set][1].push(da.task1_Acc);
                            self.ss[da.which_set][2].push(da.task2_Acc);
                            self.ss[da.which_set][3].push(da.task3_F1);
                        };
                    });
                    //
                    // self.push_alert('info', `开始重新计算Z分数……`);
                    self.update_zs();
                    for (let k of ['1', '2']) {
                        let p1 = self.zs[k]["1"];
                        let p2 = self.zs[k]["2"];
                        let p3 = self.zs[k]["3"];
                        // self.push_alert('info', `${[p1.mean, p1.std]}-${[p2.mean, p2.std]}-${[p3.mean, p3.std]}`);
                        if (final_scores[k].length) {
                            final_scores[k].forEach(da=>{
                                // console.log(da);
                                da.task1_Z = zScore(da.task1_Acc, p1.mean, p1.std);
                                da.task2_Z = zScore(da.task2_Acc, p2.mean, p2.std);
                                da.task3_Z = zScore(da.task3_F1, p3.mean, p3.std);
                                da.Z_mean = foo([da.task1_Z, da.task2_Z, da.task3_Z]).mean;
                            });
                        };
                    };
                    //
                    // self.push_alert('info', `开始重新计算排名……`);
                    self.scores = [];
                    let oo = {"1": 1, "2": 1, };
                    for (let k of ['1', '2']) {
                        // self.push_alert('info', `开始重新计算「${k}」排名……`);
                        if (final_scores[k].length) {
                            final_scores[k].forEach(da=>{
                                da.order = oo[`${da.which_set}`];
                                self.scores.push(da);
                                oo[`${da.which_set}`]++;
                            });
                        };
                    };
                    //
                    self.push_alert('info', `成功读取排行榜。`);
                    // self.push_alert('info', `Z分数计算成功。`);
                })
                .catch(({ error }) => self.push_alert('danger', `读取排行榜时发生错误：「${error}」。`));
            };
            // return greeting = await Promise.resolve("Hello");
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
        user_agent: function() {
            return navigator.userAgent;
        },
        readDataFromLocalStorage: function() {
            let self = this;
            for (let field of self.fields) {
                if (window.localStorage[`${self.app_name}:${field}`] && window.localStorage[`${self.app_name}:${field}`]!="undefined") {
                    self[field] = JSON.parse(window.localStorage[`${self.app_name}:${field}`]);
                };
            };
        },
        saveDataToLocalStorage: function() {
            let self = this;
            if(window.localStorage){
                for (let field of self.fields) {
                    window.localStorage[`${self.app_name}:${field}`] = JSON.stringify(self[field]);
                };
            };
        },

        formatDate: function(time, format='YY-MM-DD hh:mm:ss'){
        let date = new Date(time);
        //
        let year = date.getFullYear(),
            month = date.getMonth()+1,//月份是从0开始的
            day = date.getDate(),
            hour = date.getHours(),
            min = date.getMinutes(),
            sec = date.getSeconds();
        let preArr = Array.apply(null,Array(10)).map(function(elem, index) {
            return '0'+index;
        });  // 开个长度为10的数组 格式为 00 01 02 03
        //
        let newTime = format.replace(/YY/g,year)
                            .replace(/MM/g,preArr[month]||month)
                            .replace(/DD/g,preArr[day]||day)
                            .replace(/hh/g,preArr[hour]||hour)
                            .replace(/mm/g,preArr[min]||min)
                            .replace(/ss/g,preArr[sec]||sec);
        //
        return newTime;
    },

    },
    created() {
        let self = this;
        self.readDataFromLocalStorage();
        self.refresh();
    },
    updated() {
        let self = this;
        self.saveDataToLocalStorage();
    },
    // beforeDestroyed() {
    //     let self = this;
    // },

});

