tests = [{
    "name": "BROS",
    "endDate": "2018-06-01",
    "author": {
        "profile" : {
            "name" : "Deepanshu"
        }
    },
    "code": "jhzwuhx2"
}]

tests = tests.reduce(function (result, current) {
    if(new Date(current.endDate)>new Date()){
        current.endDate = new Date(current.endDate);
        var date = current.endDate.getDate()+"-"+(current.endDate.getMonth()+1)+"-"+current.endDate.getFullYear();
        var res = {
            name : current.name,
            code : current.code,
            author : current.author.profile.name,
            endDate : date
        }
        result.push(res);
    }
    return result;
}, []);

console.log(tests);