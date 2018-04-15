"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var URL = 'https://opwyliyqnu-dsn.algolia.net/1/indexes/*/queries?x-algolia-agent=Algolia for vanilla JavaScript (lite) 3.21.1;instantsearch.js 1.11.2;Magento integration (1.11.1);JS Helper 2.18.1&x-algolia-application-id=OPWYLIYQNU&x-algolia-api-key=YzQ2NDk1OGQ5NzMyYzc3ODZjNWFiNTRiODRlYmRkODQ2N2QwOTU3N2I4NDg0MTVhMzFhZjhkNjZjMjQ3ZGI4MWZpbHRlcnM9Jm51bWVyaWNGaWx0ZXJzPXZpc2liaWxpdHlfc2VhcmNoJTNEMQ==';
var axios = axios_1.default.create({
    baseURL: URL,
    headers: {
        'Referer': 'https://www.pcdiga.com'
    }
});
var mockProduct = {
    title: 'Low Profile Special Cotton Mesh Cap-Black W40S62B',
    imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/61WvsfC3EIL._UX522_.jpg',
    summary: '- Cotton\n- Black Low Profile Special Cotton Mesh Cap',
    description: 'Low profile unstructured Herringbone cotton twill/mesh cap with panels and eyelets, contrasting stitches and under bill, a frayed bill, and self-fabric strap with velcro adjustable. Available in many colors. One size fits most. ',
    price: 6.46
};
function buildRequestBody(query) {
    return {
        requests: [
            {
                indexName: 'prod_pcdiga_pt_products',
                params: "query=" + query + "&hitsPerPage=1"
            }
        ]
    };
}
function getRandomProductPage() {
    return __awaiter(this, void 0, void 0, function () {
        var randQuery, response, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    randQuery = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 2);
                    return [4 /*yield*/, axios.post('', buildRequestBody(randQuery))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.results[0].hits];
                case 2:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getRandomProductPage = getRandomProductPage;
function getRandomProduct() {
    if (process.env.MOCK_PRODUCTS) {
        return mockProduct;
    }
    //  products.itemSearch({})
    //    .then(results => {
    //      console.log(results)
    //    }).catch(err => {
    //    console.error(err)
    //    for (let error of err.Error) {
    //      console.error(error)
    //    }
    //  })
}
exports.getRandomProduct = getRandomProduct;
