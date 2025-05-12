"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.random = random;
function random(len) {
    let options = "qsdnfklnsdfkklsnflsnfklsdf123456789";
    let length = options.length;
    let ans = "";
    for (let i = 0; i < len; i++) {
        let random = Math.floor(Math.random() * length); // 0 => 20
        ans += options[random];
    }
    return ans;
}
