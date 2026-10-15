import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import vm from 'node:vm';
const exports={};vm.runInNewContext(ts.transpileModule(readFileSync('src/api/billing.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,URL,Date,Math});
test('Premium add-on quote uses 20 photos and one video per package at the server unit rate',()=>{
 const plan={code:'premium',name:'ویژه',amountToman:350000,durationDays:30,purchasable:false,features:[],annual:{amountToman:3500000,durationDays:365,purchasable:false}};
 assert.equal(exports.capacityQuote(plan,'monthly',2).amountToman,380000);
 assert.equal(exports.capacityQuote(plan,'monthly',10).amountToman,500000);
 assert.equal(exports.capacityQuote(plan,'annual',1).amountToman,3680000);
 assert.equal(exports.capacityQuote(plan,'monthly',10).purchasable,false);
 assert.throws(()=>exports.capacityQuote({...plan,code:'pro'},'monthly',1));
 assert.throws(()=>exports.capacityQuote(plan,'monthly',-1));
 assert.throws(()=>exports.capacityQuote(plan,'monthly',Infinity));
});
test('Checkout opens only the exact HTTPS production gateway, with no credentials or injected path',()=>{
  const authority='A'+'1'.repeat(35);const url=`https://www.zarinpal.com/pg/StartPay/${authority}`;assert.equal(exports.safeGatewayUrl(url),url);
  for(const bad of [`http://www.zarinpal.com/pg/StartPay/${authority}`,`https://www.zarinpal.com.evil.test/pg/StartPay/${authority}`,`https://evil@www.zarinpal.com/pg/StartPay/${authority}`,`https://www.zarinpal.com/pg/StartPay/${authority}?redirect=evil`,`https://www.zarinpal.com:444/pg/StartPay/${authority}`,'javascript:alert(1)'])assert.throws(()=>exports.safeGatewayUrl(bad));
});
